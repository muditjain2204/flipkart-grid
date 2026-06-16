import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  await prisma.analysis.deleteMany();
  await prisma.event.deleteMany();

  // Seed events
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
  ]);

  console.log(`✅ Seeded ${events.length} events:\n`);
  events.forEach((e) => {
    console.log(`  • ${e.name} (${e.eventType}) — ${e.expectedCrowd.toLocaleString()} expected`);
  });

  console.log('\n🎉 Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
