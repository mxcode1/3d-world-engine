// Database Seed Script
// Populates database with initial data (regions and POIs)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  console.log('📍 Seeding data for regions: lisbon, andalusia...');

  // Create a demo user for seed POIs
  const seedUser = await prisma.user.upsert({
    where: { email: 'seed@ogt.com' },
    update: {},
    create: {
      email: 'seed@ogt.com',
      display_name: 'OGT Team',
      bio: 'Official Original Globe Trotters curation',
      roles: ['admin'],
    },
  });

  console.log('📌 Creating POIs...');

  // Lisbon POIs
  const lisbonPOIs = [
    {
      name: 'Betahaus Lisbon',
      description: 'Modern coworking space in the heart of Príncipe Real with great community and events.',
      latitude: 38.7169,
      longitude: -9.1446,
      category: 'coworking',
      rating: 4.7,
      tags: ['wifi', 'community', 'events', 'central'],
      metadata: {
        hours: '9:00 - 19:00',
        cost: '€15/day',
        website: 'https://betahaus.com',
      },
      region: 'lisbon',
      verified: true,
    },
    {
      name: 'Fábrica Coffee Roasters',
      description: 'Specialty coffee shop perfect for remote work with excellent WiFi and atmosphere.',
      latitude: 38.7071,
      longitude: -9.1355,
      category: 'cafe',
      rating: 4.6,
      tags: ['wifi', 'coffee', 'quiet', 'bairro_alto'],
      metadata: {
        hours: '8:00 - 18:00',
        cost: '€3-8',
        wifi: true,
      },
      region: 'lisbon',
      verified: true,
    },
    // Add more Lisbon POIs...
  ];

  // Andalusia POIs
  const andalusiaPOIs = [
    {
      name: 'La Térmica Málaga',
      description: 'Cultural center and coworking space with regular events and workshops.',
      latitude: 36.7196,
      longitude: -4.4203,
      category: 'coworking',
      rating: 4.6,
      tags: ['wifi', 'cultural', 'events', 'málaga'],
      metadata: {
        hours: '10:00 - 20:00',
        cost: '€12/day',
        website: 'https://latérmica.com',
      },
      region: 'andalusia',
      verified: true,
    },
    // Add more Andalusia POIs...
  ];

  // Insert all POIs
  for (const poi of [...lisbonPOIs, ...andalusiaPOIs]) {
    // Check if POI already exists by name and location
    const existing = await prisma.pOI.findFirst({
      where: {
        name: poi.name,
        latitude: poi.latitude,
        longitude: poi.longitude,
      },
    });

    if (!existing) {
      await prisma.pOI.create({
        data: {
          ...poi,
          created_by: seedUser.id,
        },
      });
      console.log(`✓ Created POI: ${poi.name}`);
    } else {
      console.log(`→ POI already exists: ${poi.name}`);
    }
  }

  console.log('✅ POIs created');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });