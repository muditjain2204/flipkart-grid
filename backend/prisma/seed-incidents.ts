import { PrismaClient, IncidentType, IncidentCause, IncidentStatus, IncidentPriority } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ─── CSV Column Mapping ─────────────────────────────────

const CAUSE_MAP: Record<string, IncidentCause> = {
  vehicle_breakdown: 'VEHICLE_BREAKDOWN',
  accident: 'ACCIDENT',
  construction: 'CONSTRUCTION',
  water_logging: 'WATER_LOGGING',
  tree_fall: 'TREE_FALL',
  pot_holes: 'POT_HOLES',
  congestion: 'CONGESTION',
  public_event: 'PUBLIC_EVENT',
  procession: 'PROCESSION',
  vip_movement: 'VIP_MOVEMENT',
  protest: 'PROTEST',
  road_conditions: 'ROAD_CONDITIONS',
  debris: 'DEBRIS',
  Debris: 'DEBRIS',
  'Fog / Low Visibility': 'FOG_LOW_VISIBILITY',
  others: 'OTHERS',
  test_demo: 'TEST_DEMO',
};

const STATUS_MAP: Record<string, IncidentStatus> = {
  active: 'ACTIVE',
  closed: 'CLOSED',
  resolved: 'RESOLVED',
};

// ─── CSV Parser ─────────────────────────────────────────

/**
 * Parse a CSV line handling quoted fields with commas.
 * Handles: "field1","field with, comma","field3"
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());

  return fields;
}

/**
 * Parse a datetime string, returning null for invalid values.
 */
function parseDate(value: string): Date | null {
  if (!value || value === 'NULL' || value === '') return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Parse a float, returning null for invalid values.
 */
function parseFloat_(value: string): number | null {
  if (!value || value === 'NULL' || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

/**
 * Calculate resolution time in minutes between start and resolution/close time.
 */
function calcResolutionMinutes(startStr: string, endStr: string, closedStr: string, resolvedStr: string): number | null {
  const start = parseDate(startStr);
  if (!start) return null;

  // Prefer resolved_datetime, then closed_datetime, then end_datetime
  const end = parseDate(resolvedStr) || parseDate(closedStr) || parseDate(endStr);
  if (!end) return null;

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return null;

  return Math.round(diffMs / (1000 * 60));
}

// ─── Main Seeder ────────────────────────────────────────

async function seedIncidents() {
  console.log('🚦 Seeding traffic incidents from Astram dataset...\n');

  // Find the CSV file
  const csvPath = path.resolve(__dirname, '../../Astram event data_anonymized - Astram event data_anonymizedb40ac87 (1).csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    console.error('   Make sure the Astram CSV file is in the project root directory.');
    process.exit(1);
  }

  // Read and parse
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter((line) => line.trim().length > 0);

  // Header
  const headers = parseCSVLine(lines[0]);
  console.log(`📄 CSV headers (${headers.length} columns): ${headers.slice(0, 10).join(', ')}...`);
  console.log(`📊 Total data rows: ${lines.length - 1}\n`);

  // Create header index for reliable column lookup
  const headerIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    headerIndex[h.replace(/\r/g, '')] = i;
  });

  // Clear existing incidents
  const deleted = await prisma.trafficIncident.deleteMany();
  console.log(`🗑️  Cleared ${deleted.count} existing incidents.\n`);

  // Parse all rows
  const incidents: Parameters<typeof prisma.trafficIncident.createMany>[0]['data'] = [];
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);

    try {
      const id = fields[headerIndex['id']];
      const eventType = fields[headerIndex['event_type']];
      const cause = fields[headerIndex['event_cause']];
      const status = fields[headerIndex['status']];
      const priority = fields[headerIndex['priority']];
      const lat = parseFloat_(fields[headerIndex['latitude']]);
      const lng = parseFloat_(fields[headerIndex['longitude']]);
      const startDt = fields[headerIndex['start_datetime']];

      // Skip rows with missing critical fields
      if (!id || !eventType || !cause || !lat || !lng || !startDt) {
        skipped++;
        continue;
      }

      // Map cause
      const mappedCause = CAUSE_MAP[cause];
      if (!mappedCause) {
        errors.push(`Row ${i + 1}: Unknown cause '${cause}'`);
        skipped++;
        continue;
      }

      // Map status
      const mappedStatus = STATUS_MAP[status] || 'CLOSED';

      // Map priority
      const mappedPriority: IncidentPriority =
        priority === 'High' ? 'HIGH' : 'LOW';

      // Map type
      const mappedType: IncidentType =
        eventType === 'planned' ? 'PLANNED' : 'UNPLANNED';

      // Parse dates
      const startDate = parseDate(startDt);
      if (!startDate) {
        skipped++;
        continue;
      }

      const endLat = parseFloat_(fields[headerIndex['endlatitude']]);
      const endLng = parseFloat_(fields[headerIndex['endlongitude']]);

      // Calculate resolution time
      const resolutionMinutes = calcResolutionMinutes(
        startDt,
        fields[headerIndex['end_datetime']],
        fields[headerIndex['closed_datetime']],
        fields[headerIndex['resolved_datetime']]
      );

      incidents.push({
        id,
        incidentType: mappedType,
        cause: mappedCause,
        latitude: lat,
        longitude: lng,
        endLatitude: endLat && endLat !== 0 ? endLat : null,
        endLongitude: endLng && endLng !== 0 ? endLng : null,
        address: fields[headerIndex['address']] || 'Unknown',
        endAddress: fields[headerIndex['end_address']] || null,
        requiresRoadClosure: fields[headerIndex['requires_road_closure']] === 'TRUE',
        startDatetime: startDate,
        endDatetime: parseDate(fields[headerIndex['end_datetime']]),
        status: mappedStatus,
        priority: mappedPriority,
        description: fields[headerIndex['description']] || null,
        vehicleType: fields[headerIndex['veh_type']] || null,
        vehicleNo: fields[headerIndex['veh_no']] || null,
        corridor: fields[headerIndex['corridor']] || null,
        policeStation: fields[headerIndex['police_station']] || null,
        zone: fields[headerIndex['zone']] || null,
        junction: fields[headerIndex['junction']] || null,
        resolutionMinutes,
      });
    } catch (err) {
      errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : String(err)}`);
      skipped++;
    }
  }

  console.log(`✅ Parsed ${incidents.length} incidents (${skipped} skipped)`);

  if (errors.length > 0) {
    console.log(`\n⚠️  Parse errors (first 10):`);
    errors.slice(0, 10).forEach((e) => console.log(`   ${e}`));
  }

  // Batch insert (Prisma createMany has a limit, so we chunk)
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < incidents.length; i += BATCH_SIZE) {
    const batch = incidents.slice(i, i + BATCH_SIZE);
    const result = await prisma.trafficIncident.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += result.count;
    process.stdout.write(`\r   Inserted ${inserted}/${incidents.length} records...`);
  }

  console.log(`\n\n📊 Seeding Summary:`);

  // Print stats
  const totalCount = await prisma.trafficIncident.count();
  console.log(`   Total records: ${totalCount}`);

  const causeStats = await prisma.trafficIncident.groupBy({
    by: ['cause'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });
  console.log(`\n   Incidents by cause:`);
  causeStats.forEach((s) => {
    console.log(`     ${s.cause}: ${s._count.id}`);
  });

  const corridorStats = await prisma.trafficIncident.groupBy({
    by: ['corridor'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });
  console.log(`\n   Top 10 corridors:`);
  corridorStats.forEach((s) => {
    console.log(`     ${s.corridor || 'Unknown'}: ${s._count.id}`);
  });

  console.log('\n🎉 Incident seeding complete!');
}

seedIncidents()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
