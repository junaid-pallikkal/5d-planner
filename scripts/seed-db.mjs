import pkg from 'pg';
const { Client } = pkg;
import {
  TEMPLATE_MINIMALIST_VILLA,
  TEMPLATE_FLATS,
  TEMPLATE_BUILDING,
  TEMPLATE_LUXURY_HOME,
  TEMPLATE_CAFE,
  TEMPLATE_STUDIO,
} from '../src/constants/templates.ts';
import { FURNITURE_CATALOG } from '../src/constants/furniture-catalog.ts';
import { DEFAULT_MATERIALS } from '../src/constants/default-materials.ts';

// Additional Architectural Demo: Nordic Eco Pavilion with Green Sedum Roof
const DEMO_ECO_PAVILION = {
  id: 'demo_eco_pavilion',
  name: 'Nordic Eco Pavilion & Exhibition Gallery',
  description: 'Sustainable timber-frame pavilion featuring an eco sedum green roof, open exhibition floor, glass atrium, and solar rainwater harvesting',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  activeFloorId: 'floor_ground',
  materials: DEFAULT_MATERIALS,
  settings: {
    unit: 'metric_m',
    gridSize: 0.5,
    gridSnap: true,
    angleSnap: true,
    angleSnapIncrement: 45,
    objectSnap: true,
    wallThicknessDefault: 0.25,
    wallHeightDefault: 3.5,
    ceilingHeightDefault: 3.5,
    theme: 'light',
    sunAzimuth: 140,
    sunAltitude: 50,
    shadowsEnabled: true,
    showDimensions: true,
    showRulers: true,
    showGrid: true,
  },
  camera: {
    mode: 'orbit',
    position: { x: 20, y: 16, z: 20 },
    target: { x: 7, y: 1.5, z: 6 },
    zoom: 1,
  },
  floors: [
    {
      id: 'floor_ground',
      level: 0,
      name: 'Pavilion Ground Floor',
      elevation: 0,
      height: 3.5,
      walls: [
        { id: 'we1', floorId: 'floor_ground', start: { x: 0, y: 0 }, end: { x: 14, y: 0 }, thickness: 0.25, height: 3.5, isExterior: true, exteriorMaterialId: 'mat_walnut_wood', interiorMaterialId: 'mat_white_paint' },
        { id: 'we2', floorId: 'floor_ground', start: { x: 14, y: 0 }, end: { x: 14, y: 12 }, thickness: 0.25, height: 3.5, isExterior: true, exteriorMaterialId: 'mat_walnut_wood', interiorMaterialId: 'mat_white_paint' },
        { id: 'we3', floorId: 'floor_ground', start: { x: 14, y: 12 }, end: { x: 0, y: 12 }, thickness: 0.25, height: 3.5, isExterior: true, exteriorMaterialId: 'mat_walnut_wood', interiorMaterialId: 'mat_white_paint' },
        { id: 'we4', floorId: 'floor_ground', start: { x: 0, y: 12 }, end: { x: 0, y: 0 }, thickness: 0.25, height: 3.5, isExterior: true, exteriorMaterialId: 'mat_walnut_wood', interiorMaterialId: 'mat_white_paint' },
        // Interior atrium & exhibition zone partition
        { id: 'wep1', floorId: 'floor_ground', start: { x: 9, y: 0 }, end: { x: 9, y: 12 }, thickness: 0.15, height: 3.5, isExterior: false, interiorMaterialId: 'mat_white_paint' },
      ],
      doors: [
        { id: 'de1', wallId: 'we1', floorId: 'floor_ground', distanceRatio: 0.35, width: 2.2, height: 2.6, type: 'double', swingDirection: 'inward_right' },
        { id: 'de2', wallId: 'wep1', floorId: 'floor_ground', distanceRatio: 0.5, width: 2.0, height: 2.4, type: 'sliding', swingDirection: 'inward_left' },
      ],
      windows: [
        { id: 'wine1', wallId: 'we4', floorId: 'floor_ground', distanceRatio: 0.5, width: 6.0, height: 2.6, elevationFromFloor: 0.4, type: 'sliding' },
        { id: 'wine2', wallId: 'we2', floorId: 'floor_ground', distanceRatio: 0.5, width: 5.0, height: 2.6, elevationFromFloor: 0.4, type: 'sliding' },
      ],
      rooms: [
        {
          id: 'room_gallery',
          floorId: 'floor_ground',
          name: 'Main Exhibition Hall',
          type: 'living',
          color: '#16a34a',
          polygon: [{ x: 0, y: 0 }, { x: 9, y: 0 }, { x: 9, y: 12 }, { x: 0, y: 12 }],
          area: 108.0,
          perimeter: 42.0,
          floorMaterialId: 'mat_oak_hardwood',
          wallIds: ['we1', 'wep1', 'we3', 'we4'],
        },
        {
          id: 'room_lounge',
          floorId: 'floor_ground',
          name: 'Sculpture Garden & Atrium Lounge',
          type: 'balcony',
          color: '#10b981',
          polygon: [{ x: 9, y: 0 }, { x: 14, y: 0 }, { x: 14, y: 12 }, { x: 9, y: 12 }],
          area: 60.0,
          perimeter: 34.0,
          floorMaterialId: 'mat_concrete_raw',
          wallIds: ['we1', 'we2', 'we3', 'wep1'],
        },
      ],
      furniture: [
        { id: 'fe1', floorId: 'floor_ground', assetId: 'sofa_3_seater', name: 'Atrium Bench', category: 'seating', position: { x: 4.5, y: 0, z: 6.0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1.5, y: 1, z: 1 }, dimensions: { width: 3.3, depth: 0.9, height: 0.8 } },
        { id: 'fe2', floorId: 'floor_ground', assetId: 'potted_monstera', name: 'Atrium Palm', category: 'decor', position: { x: 11.5, y: 0, z: 3.0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1.5, y: 1.5, z: 1.5 }, dimensions: { width: 0.9, depth: 0.9, height: 1.8 } },
        { id: 'fe3', floorId: 'floor_ground', assetId: 'potted_monstera', name: 'Atrium Palm 2', category: 'decor', position: { x: 11.5, y: 0, z: 9.0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1.5, y: 1.5, z: 1.5 }, dimensions: { width: 0.9, depth: 0.9, height: 1.8 } },
      ],
      roofs: [
        {
          id: 'roof_eco',
          floorId: 'floor_ground',
          name: 'Living Sedum Green Roof',
          type: 'green',
          pitch: 2.0,
          overhang: 0.5,
          thickness: 0.38,
          fasciaDepth: 0.25,
          parapetHeight: 0.45,
          elevationOffset: 3.5,
          polygon: [{ x: -0.5, y: -0.5 }, { x: 14.5, y: -0.5 }, { x: 14.5, y: 12.5 }, { x: -0.5, y: 12.5 }],
          color: '#15803d',
          hasSolarPanels: true,
          solarDensity: 0.4,
          showTrusses: true,
          hasGutters: true,
          drainageSlope: 2.0,
        },
      ],
      lights: [
        { id: 'light_eco_sun', floorId: 'floor_ground', type: 'sun', position: { x: 22, y: 28, z: 22 }, intensity: 1.3, color: '#fffbf0', castShadow: true },
      ],
      dimensions: [
        { id: 'dim_e1', floorId: 'floor_ground', start: { x: 0, y: 12 }, end: { x: 14, y: 12 }, offset: 0.7, calculatedLength: 14.0 },
      ],
    },
  ],
};

// Additional Architectural Demo: Luxury Penthouse Suite with Skyline Terrace
const DEMO_PENTHOUSE = {
  id: 'demo_penthouse',
  name: 'Skyline Luxury Penthouse Suite',
  description: 'Top-floor luxury penthouse with wraparound glass curtain walls, private master retreat, cocktail bar, and open-air skyline terrace',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  activeFloorId: 'floor_ground',
  materials: DEFAULT_MATERIALS,
  settings: {
    unit: 'metric_m',
    gridSize: 0.5,
    gridSnap: true,
    angleSnap: true,
    angleSnapIncrement: 45,
    objectSnap: true,
    wallThicknessDefault: 0.2,
    wallHeightDefault: 3.2,
    ceilingHeightDefault: 3.2,
    theme: 'light',
    sunAzimuth: 150,
    sunAltitude: 40,
    shadowsEnabled: true,
    showDimensions: true,
    showRulers: true,
    showGrid: true,
  },
  camera: {
    mode: 'orbit',
    position: { x: 20, y: 18, z: 20 },
    target: { x: 7.5, y: 1.5, z: 5.5 },
    zoom: 1,
  },
  floors: [
    {
      id: 'floor_ground',
      level: 0,
      name: 'Penthouse Floor',
      elevation: 0,
      height: 3.2,
      walls: [
        { id: 'wp1', floorId: 'floor_ground', start: { x: 0, y: 0 }, end: { x: 15, y: 0 }, thickness: 0.2, height: 3.2, isExterior: true, exteriorMaterialId: 'mat_concrete_raw', interiorMaterialId: 'mat_white_paint' },
        { id: 'wp2', floorId: 'floor_ground', start: { x: 15, y: 0 }, end: { x: 15, y: 11 }, thickness: 0.2, height: 3.2, isExterior: true, exteriorMaterialId: 'mat_concrete_raw', interiorMaterialId: 'mat_white_paint' },
        { id: 'wp3', floorId: 'floor_ground', start: { x: 15, y: 11 }, end: { x: 0, y: 11 }, thickness: 0.2, height: 3.2, isExterior: true, exteriorMaterialId: 'mat_concrete_raw', interiorMaterialId: 'mat_white_paint' },
        { id: 'wp4', floorId: 'floor_ground', start: { x: 0, y: 11 }, end: { x: 0, y: 0 }, thickness: 0.2, height: 3.2, isExterior: true, exteriorMaterialId: 'mat_concrete_raw', interiorMaterialId: 'mat_white_paint' },
        // Suite partition
        { id: 'wpp1', floorId: 'floor_ground', start: { x: 8, y: 0 }, end: { x: 8, y: 7 }, thickness: 0.15, height: 3.2, isExterior: false, interiorMaterialId: 'mat_white_paint' },
        { id: 'wpp2', floorId: 'floor_ground', start: { x: 0, y: 7 }, end: { x: 15, y: 7 }, thickness: 0.2, height: 3.2, isExterior: false, interiorMaterialId: 'mat_white_paint' },
      ],
      doors: [
        { id: 'dp1', wallId: 'wp4', floorId: 'floor_ground', distanceRatio: 0.3, width: 1.2, height: 2.3, type: 'single', swingDirection: 'inward_right' },
        { id: 'dp2', wallId: 'wpp1', floorId: 'floor_ground', distanceRatio: 0.5, width: 1.0, height: 2.2, type: 'sliding', swingDirection: 'inward_left' },
      ],
      windows: [
        { id: 'winp1', wallId: 'wp1', floorId: 'floor_ground', distanceRatio: 0.3, width: 3.5, height: 2.4, elevationFromFloor: 0.4, type: 'sliding' },
        { id: 'winp2', wallId: 'wp1', floorId: 'floor_ground', distanceRatio: 0.75, width: 3.5, height: 2.4, elevationFromFloor: 0.4, type: 'sliding' },
      ],
      rooms: [
        {
          id: 'room_p_living',
          floorId: 'floor_ground',
          name: 'Penthouse Great Salon & Bar',
          type: 'living',
          color: '#16a34a',
          polygon: [{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 7 }, { x: 0, y: 7 }],
          area: 56.0,
          perimeter: 30.0,
          floorMaterialId: 'mat_oak_hardwood',
          wallIds: ['wp1', 'wpp1', 'wpp2', 'wp4'],
        },
        {
          id: 'room_p_master',
          floorId: 'floor_ground',
          name: 'Presidential Bedroom Suite',
          type: 'bedroom',
          color: '#06b6d4',
          polygon: [{ x: 8, y: 0 }, { x: 15, y: 0 }, { x: 15, y: 7 }, { x: 8, y: 7 }],
          area: 49.0,
          perimeter: 28.0,
          floorMaterialId: 'mat_marble_carrara',
          wallIds: ['wp1', 'wp2', 'wpp2', 'wpp1'],
        },
        {
          id: 'room_p_terrace',
          floorId: 'floor_ground',
          name: 'Open-Air Skyline Terrace',
          type: 'balcony',
          color: '#10b981',
          polygon: [{ x: 0, y: 7 }, { x: 15, y: 7 }, { x: 15, y: 11 }, { x: 0, y: 11 }],
          area: 60.0,
          perimeter: 38.0,
          floorMaterialId: 'mat_concrete_raw',
          wallIds: ['wpp2', 'wp2', 'wp3', 'wp4'],
        },
      ],
      furniture: [
        { id: 'fp_sofa', floorId: 'floor_ground', assetId: 'sofa_3_seater', name: 'Designer Sectional', category: 'seating', position: { x: 4.0, y: 0, z: 3.5 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1.3, y: 1, z: 1.1 }, dimensions: { width: 2.8, depth: 1.0, height: 0.8 } },
        { id: 'fp_bed', floorId: 'floor_ground', assetId: 'bed_king', name: 'Master King Bed', category: 'beds', position: { x: 11.5, y: 0, z: 3.5 }, rotation: { x: 0, y: Math.PI, z: 0 }, scale: { x: 1, y: 1, z: 1 }, dimensions: { width: 1.95, depth: 2.15, height: 1.1 } },
      ],
      roofs: [
        {
          id: 'roof_penthouse',
          floorId: 'floor_ground',
          name: 'Sleek Flat Parapet Roof',
          type: 'flat',
          pitch: 1.0,
          overhang: 0.3,
          thickness: 0.3,
          fasciaDepth: 0.2,
          parapetHeight: 0.65,
          elevationOffset: 3.2,
          polygon: [{ x: -0.3, y: -0.3 }, { x: 15.3, y: -0.3 }, { x: 15.3, y: 11.3 }, { x: -0.3, y: 11.3 }],
          color: '#334155',
          hasSolarPanels: true,
          solarDensity: 0.6,
          showTrusses: false,
          hasGutters: false,
          drainageSlope: 1.0,
        },
      ],
      lights: [
        { id: 'light_p_sun', floorId: 'floor_ground', type: 'sun', position: { x: 22, y: 26, z: 22 }, intensity: 1.3, color: '#fffbf0', castShadow: true },
      ],
      dimensions: [
        { id: 'dim_p1', floorId: 'floor_ground', start: { x: 0, y: 11 }, end: { x: 15, y: 11 }, offset: 0.7, calculatedLength: 15.0 },
      ],
    },
  ],
};

const ALL_PROJECTS = [
  TEMPLATE_MINIMALIST_VILLA,
  TEMPLATE_FLATS,
  TEMPLATE_BUILDING,
  TEMPLATE_LUXURY_HOME,
  TEMPLATE_CAFE,
  TEMPLATE_STUDIO,
  DEMO_ECO_PAVILION,
  DEMO_PENTHOUSE,
];

async function seedDatabase() {
  const client = new Client({
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.tvojtlmwazokheugdaan',
    password: '5dplanner123!',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  // 1. Seed Demo Architect User
  await client.query(`
    INSERT INTO "User" (id, name, email, role, "updatedAt")
    VALUES ('user_demo_architect', 'Senior Principal Architect', 'architect@5dplanner.com', 'ADMIN', NOW())
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW();
  `);
  console.log('✔ Seeded User: Senior Principal Architect');

  // 2. Seed Asset Categories
  const categories = [
    { id: 'cat_seating', name: 'Seating & Sofas', icon: 'Armchair', order: 1 },
    { id: 'cat_tables', name: 'Tables & Desks', icon: 'Table', order: 2 },
    { id: 'cat_beds', name: 'Beds & Mattresses', icon: 'Bed', order: 3 },
    { id: 'cat_storage', name: 'Storage & Closets', icon: 'Box', order: 4 },
    { id: 'cat_kitchen', name: 'Kitchen & Appliances', icon: 'Utensils', order: 5 },
    { id: 'cat_bathroom', name: 'Bathroom & Sanitary', icon: 'Bath', order: 6 },
    { id: 'cat_office', name: 'Office & Workstations', icon: 'Laptop', order: 7 },
    { id: 'cat_lighting', name: 'Architectural Lighting', icon: 'Lightbulb', order: 8 },
    { id: 'cat_decor', name: 'Plants & Biophilic Decor', icon: 'Flower2', order: 9 },
  ];

  for (const cat of categories) {
    await client.query(`
      INSERT INTO "AssetCategory" (id, name, icon, "order", "createdAt")
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon, "order" = EXCLUDED."order";
    `, [cat.id, cat.name, cat.icon, cat.order]);
  }
  console.log(`✔ Seeded ${categories.length} Asset Categories`);

  // Map category slugs to category IDs
  const catSlugMap = {
    seating: 'cat_seating',
    tables: 'cat_tables',
    beds: 'cat_beds',
    storage: 'cat_storage',
    kitchen: 'cat_kitchen',
    bathroom: 'cat_bathroom',
    office: 'cat_office',
    lighting: 'cat_lighting',
    decor: 'cat_decor',
  };

  // 3. Seed 3D Furniture & Fixtures Assets
  let assetCount = 0;
  for (const asset of FURNITURE_CATALOG) {
    const categoryId = catSlugMap[asset.category] || 'cat_seating';
    await client.query(`
      INSERT INTO "Asset" (id, name, "categoryId", dimensions, "defaultProps", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        "categoryId" = EXCLUDED."categoryId",
        dimensions = EXCLUDED.dimensions,
        "defaultProps" = EXCLUDED."defaultProps",
        "updatedAt" = NOW();
    `, [
      asset.id,
      asset.name,
      categoryId,
      JSON.stringify(asset.dimensions),
      JSON.stringify({ defaultColor: asset.defaultColor, description: asset.description, icon: asset.icon })
    ]);
    assetCount++;
  }
  console.log(`✔ Seeded ${assetCount} 3D Furniture Assets in Catalog`);

  // 4. Seed Standard PBR Materials
  let materialCount = 0;
  for (const mat of DEFAULT_MATERIALS) {
    await client.query(`
      INSERT INTO "Material" (id, name, color, roughness, metalness, category, "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        color = EXCLUDED.color,
        roughness = EXCLUDED.roughness,
        metalness = EXCLUDED.metalness,
        category = EXCLUDED.category,
        "updatedAt" = NOW();
    `, [mat.id, mat.name, mat.color, mat.roughness, mat.metalness, mat.category]);
    materialCount++;
  }
  console.log(`✔ Seeded ${materialCount} PBR Architectural Materials`);

  // 5. Seed Demo Architectural Projects & Multi-Story Floors
  let projectCount = 0;
  let floorCount = 0;
  for (const p of ALL_PROJECTS) {
    await client.query(`
      INSERT INTO "Project" (id, name, description, "isPublic", settings, data, "userId", "updatedAt")
      VALUES ($1, $2, $3, true, $4, $5, 'user_demo_architect', NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        settings = EXCLUDED.settings,
        data = EXCLUDED.data,
        "updatedAt" = NOW();
    `, [
      p.id,
      p.name,
      p.description,
      JSON.stringify(p.settings || {}),
      JSON.stringify(p)
    ]);
    projectCount++;

    // Seed each floor belonging to this project
    for (const fl of p.floors || []) {
      const uniqueFloorId = `${p.id}_${fl.id}`;
      await client.query(`
        INSERT INTO "Floor" (id, level, name, elevation, height, data, "projectId", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (id) DO UPDATE SET
          level = EXCLUDED.level,
          name = EXCLUDED.name,
          elevation = EXCLUDED.elevation,
          height = EXCLUDED.height,
          data = EXCLUDED.data,
          "updatedAt" = NOW();
      `, [
        uniqueFloorId,
        fl.level || 0,
        fl.name || 'Floor',
        fl.elevation || 0.0,
        fl.height || 2.8,
        JSON.stringify(fl),
        p.id
      ]);
      floorCount++;
    }
  }

  console.log(`✔ Seeded ${projectCount} Architectural Demo Models and ${floorCount} Building Story Floors in Supabase!`);

  // Print summary of database row counts
  const counts = await client.query(`
    SELECT 'Project' as tbl, count(*) as count FROM "Project"
    UNION ALL SELECT 'Floor', count(*) FROM "Floor"
    UNION ALL SELECT 'Asset', count(*) FROM "Asset"
    UNION ALL SELECT 'AssetCategory', count(*) FROM "AssetCategory"
    UNION ALL SELECT 'Material', count(*) FROM "Material"
    UNION ALL SELECT 'User', count(*) FROM "User";
  `);

  console.log('\n--- Final Supabase Database Inventory ---');
  console.table(counts.rows);

  await client.end();
}

seedDatabase().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
