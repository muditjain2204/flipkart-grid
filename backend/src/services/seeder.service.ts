import { PrismaClient, IncidentType, IncidentCause, IncidentStatus, IncidentPriority } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

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

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
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

function parseDate(value: string): Date | null {
  if (!value || value === 'NULL' || value === '') return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function parseFloat_(value: string): number | null {
  if (!value || value === 'NULL' || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function calcResolutionMinutes(startStr: string, endStr: string, closedStr: string, resolvedStr: string): number | null {
  const start = parseDate(startStr);
  if (!start) return null;

  const end = parseDate(resolvedStr) || parseDate(closedStr) || parseDate(endStr);
  if (!end) return null;

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return null;

  return Math.round(diffMs / (1000 * 60));
}

export async function seedDatabase(): Promise<{ eventsCount: number; incidentsCount: number }> {
  logger.info('🔄 System Seed Request Triggered.');

  // 1. CLEAR AND SEED EVENTS
  await prisma.analysis.deleteMany();
  await prisma.event.deleteMany();

  const events = await Promise.all([
    prisma.event.create({
      data: {
        name: 'IPL Final 2026 — MI vs CSK',
        venue: 'Narendra Modi Stadium, Ahmedabad',
        eventType: 'SPORTS',
        expectedCrowd: 132000,
        startTime: new Date('2026-07-15T19:30:00+05:30'),
        endTime: new Date('2026-07-15T23:30:00+05:30'),
        latitude: 23.0919,
        longitude: 72.5967,
        description: 'Indian Premier League Final at the world\'s largest cricket stadium.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Diwali Mela & Night Market',
        venue: 'India Gate Lawns, New Delhi',
        eventType: 'FESTIVAL',
        expectedCrowd: 50000,
        startTime: new Date('2026-10-20T16:00:00+05:30'),
        endTime: new Date('2026-10-20T23:59:00+05:30'),
        latitude: 28.6129,
        longitude: 77.2295,
        description: 'Annual Diwali celebration with food stalls, cultural performances, and fireworks.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'State Election Campaign Rally',
        venue: 'Ramlila Maidan, New Delhi',
        eventType: 'POLITICAL_RALLY',
        expectedCrowd: 25000,
        startTime: new Date('2026-08-10T10:00:00+05:30'),
        endTime: new Date('2026-08-10T14:00:00+05:30'),
        latitude: 28.6375,
        longitude: 77.2405,
        description: 'Major political rally with high-profile speakers. Heavy security expected.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Metro Line 4 Construction — Phase 2',
        venue: 'MG Road to Silk Board Junction, Bengaluru',
        eventType: 'CONSTRUCTION',
        expectedCrowd: 0,
        startTime: new Date('2026-07-01T06:00:00+05:30'),
        endTime: new Date('2026-12-31T22:00:00+05:30'),
        latitude: 12.9716,
        longitude: 77.5946,
        description: 'Long-term metro construction with 2-lane road closure on MG Road.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'IIT Bombay TechFest',
        venue: 'IIT Bombay Campus, Powai',
        eventType: 'OTHER',
        expectedCrowd: 5000,
        startTime: new Date('2026-09-15T09:00:00+05:30'),
        endTime: new Date('2026-09-17T21:00:00+05:30'),
        latitude: 19.1334,
        longitude: 72.9133,
        description: 'Annual technology festival with workshops, hackathons, and guest lectures.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Mumbai Midnight Marathon',
        venue: 'Marine Drive to Bandra-Worli Sea Link, Mumbai',
        eventType: 'SPORTS',
        expectedCrowd: 18000,
        startTime: new Date('2026-11-05T22:00:00+05:30'),
        endTime: new Date('2026-11-06T04:00:00+05:30'),
        latitude: 18.9438,
        longitude: 72.8228,
        description: 'Night marathon stretching along the coast, requiring major road closures and police redirection.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Sunburn Festival Goa Arena Tour',
        venue: 'DY Patil Stadium, Navi Mumbai',
        eventType: 'CONCERT',
        expectedCrowd: 45000,
        startTime: new Date('2026-12-18T16:00:00+05:30'),
        endTime: new Date('2026-12-18T23:30:00+05:30'),
        latitude: 19.0413,
        longitude: 73.0253,
        description: 'Mega music concert causing heavy incoming flow from Mumbai and Pune expressways.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Farmers Peaceful March & Demonstration',
        venue: 'Jantar Mantar, New Delhi',
        eventType: 'PROTEST',
        expectedCrowd: 30000,
        startTime: new Date('2026-09-22T09:00:00+05:30'),
        endTime: new Date('2026-09-22T18:00:00+05:30'),
        latitude: 28.6271,
        longitude: 77.2166,
        description: 'Organized advocacy rally. Traffic blocks expected around Connaught Place and Parliament Street.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Ganesh Visarjan Procession',
        venue: 'Lalbaug to Girgaon Chowpatty, Mumbai',
        eventType: 'RELIGIOUS',
        expectedCrowd: 200000,
        startTime: new Date('2026-09-08T10:00:00+05:30'),
        endTime: new Date('2026-09-09T02:00:00+05:30'),
        latitude: 18.9554,
        longitude: 72.8122,
        description: 'Massive religious festival immersion walk. Complete pedestrian takeover of arterial South Mumbai roads.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'G20 Bilateral Summit & VIP Escort',
        venue: 'Taj Palace to Pragati Maidan, New Delhi',
        eventType: 'OTHER',
        expectedCrowd: 800,
        startTime: new Date('2026-08-25T08:00:00+05:30'),
        endTime: new Date('2026-08-25T17:00:00+05:30'),
        latitude: 28.5975,
        longitude: 77.1722,
        description: 'High-security convoy movements. Rolling road closures and emergency priority routes.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Dussehra Ravan Dahan Ceremony',
        venue: 'Red Fort Ground, New Delhi',
        eventType: 'FESTIVAL',
        expectedCrowd: 60000,
        startTime: new Date('2026-10-12T17:00:00+05:30'),
        endTime: new Date('2026-10-12T21:30:00+05:30'),
        latitude: 28.6558,
        longitude: 77.2410,
        description: 'Spectator gathering for standard Dussehra celebration and fireworks near Chandni Chowk.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Flyover Structural Maintenance & Repair',
        venue: 'Hebbal Flyover, Bengaluru',
        eventType: 'CONSTRUCTION',
        expectedCrowd: 0,
        startTime: new Date('2026-07-20T23:00:00+05:30'),
        endTime: new Date('2026-07-27T05:00:00+05:30'),
        latitude: 13.0359,
        longitude: 77.5978,
        description: 'Major bottleneck point repair. Single-lane operations for one week.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Diljit Dosanjh Dil-Luminati India Tour',
        venue: 'Jawaharlal Nehru Stadium, New Delhi',
        eventType: 'CONCERT',
        expectedCrowd: 55000,
        startTime: new Date('2026-10-26T18:00:00+05:30'),
        endTime: new Date('2026-10-26T22:30:00+05:30'),
        latitude: 28.5828,
        longitude: 77.2344,
        description: 'Huge pop-music concert. Unprecedented vehicular and pedestrian crowds in Central-South Delhi.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Prime Minister Mega Public Address',
        venue: 'Shivaji Park, Mumbai',
        eventType: 'POLITICAL_RALLY',
        expectedCrowd: 80000,
        startTime: new Date('2026-11-12T14:00:00+05:30'),
        endTime: new Date('2026-11-12T18:30:00+05:30'),
        latitude: 19.0268,
        longitude: 72.8377,
        description: 'Massive national election rally. High security protocols and multiple route diversions.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Durga Puja Sindoor Khela & Immersion',
        venue: 'CR Park Kalibari, New Delhi',
        eventType: 'RELIGIOUS',
        expectedCrowd: 120000,
        startTime: new Date('2026-10-14T12:00:00+05:30'),
        endTime: new Date('2026-10-14T22:00:00+05:30'),
        latitude: 28.5361,
        longitude: 77.2519,
        description: 'Bengali community festival grand finale. Slow-moving processions around Greater Kailash.',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Pro Kabaddi League Playoffs',
        venue: 'Kanteerava Indoor Stadium, Bengaluru',
        eventType: 'SPORTS',
        expectedCrowd: 12000,
        startTime: new Date('2026-08-02T18:00:00+05:30'),
        endTime: new Date('2026-08-02T22:00:00+05:30'),
        latitude: 12.9696,
        longitude: 77.5928,
        description: 'Indoor league finals. Heavy vehicle parking queues around Hudson Circle.',
      },
    })
  ]);

  logger.info(`✅ Seeded ${events.length} events.`);

  // 2. SEED INCIDENTS FROM CSV
  const csvPath = path.resolve(__dirname, '../../../Astram event data_anonymized - Astram event data_anonymizedb40ac87 (1).csv');

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter((line) => line.trim().length > 0);
  const headers = parseCSVLine(lines[0]);

  const headerIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    headerIndex[h.replace(/\r/g, '')] = i;
  });

  await prisma.trafficIncident.deleteMany();

  const incidents: {
    id: string;
    incidentType: IncidentType;
    cause: IncidentCause;
    latitude: number;
    longitude: number;
    endLatitude: number | null;
    endLongitude: number | null;
    address: string;
    endAddress: string | null;
    requiresRoadClosure: boolean;
    startDatetime: Date;
    endDatetime: Date | null;
    status: IncidentStatus;
    priority: IncidentPriority;
    description: string | null;
    vehicleType: string | null;
    vehicleNo: string | null;
    corridor: string | null;
    policeStation: string | null;
    zone: string | null;
    junction: string | null;
    resolutionMinutes: number | null;
  }[] = [];

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

      if (!id || !eventType || !cause || !lat || !lng || !startDt) continue;

      const mappedCause = CAUSE_MAP[cause];
      if (!mappedCause) continue;

      const mappedStatus = STATUS_MAP[status] || 'CLOSED';
      const mappedPriority: IncidentPriority = priority === 'High' ? 'HIGH' : 'LOW';
      const mappedType: IncidentType = eventType === 'planned' ? 'PLANNED' : 'UNPLANNED';
      const startDate = parseDate(startDt);
      if (!startDate) continue;

      const endLat = parseFloat_(fields[headerIndex['endlatitude']]);
      const endLng = parseFloat_(fields[headerIndex['endlongitude']]);

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
      // Ignore parse errors to keep seeding robust
    }
  }

  // Chunk insert
  const BATCH_SIZE = 500;
  let inserted = 0;
  for (let i = 0; i < incidents.length; i += BATCH_SIZE) {
    const batch = incidents.slice(i, i + BATCH_SIZE);
    const result = await prisma.trafficIncident.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += result.count;
  }

  logger.info(`✅ Seeded ${inserted} traffic incidents.`);
  return { eventsCount: events.length, incidentsCount: inserted };
}
