// Database Seed Script
// Populates database with initial data (regions and POIs)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create regions
  console.log('📍 Creating regions...');
  
  const lisbon = await prisma.region.upsert({
    where: { id: 'lisbon' },
    update: {},
    create: {
      id: 'lisbon',
      name: 'Lisbon Metropolitan Area',
      bounds: {
        north: 38.8,
        south: 38.65,
        east: -9.05,
        west: -9.25,
      },
      center: {
        lat: 38.7223,
        lon: -9.1393,
        altitude: 50000,
      },
      zoom_level: 12,
      tile_providers: {
        terrain: 'cesium-world-terrain',
        imagery: 'cesium-osm-buildings',
      },
      featured_pois: [],
      description: 'Lisbon, Portugal - vibrant capital city with thriving digital nomad community',
      population: 2800000,
      timezone: 'Europe/Lisbon',
    },
  });

  const andalusia = await prisma.region.upsert({
    where: { id: 'andalusia' },
    update: {},
    create: {
      id: 'andalusia',
      name: 'Andalusia Region',
      bounds: {
        north: 38.7,
        south: 36.0,
        east: -1.6,
        west: -7.5,
      },
      center: {
        lat: 37.3891,
        lon: -5.9845,
        altitude: 150000,
      },
      zoom_level: 8,
      tile_providers: {
        terrain: 'cesium-world-terrain',
        imagery: 'cesium-osm-buildings',
      },
      featured_pois: [],
      description: 'Andalusia, Spain - sun-soaked region with beaches, culture, and great connectivity',
      population: 8500000,
      timezone: 'Europe/Madrid',
    },
  });

  console.log('✅ Regions created');

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
    await prisma.pOI.upsert({
      where: { 
        // Use a compound key approach or generate a unique identifier
        id: `${poi.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${poi.region}`,
      },
      update: {},
      create: {
        ...poi,
        created_by: seedUser.id,
      },
    });
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