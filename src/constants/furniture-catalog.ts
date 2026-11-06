export interface CatalogAsset {
  id: string;
  name: string;
  category: 'seating' | 'tables' | 'beds' | 'storage' | 'kitchen' | 'bathroom' | 'lighting' | 'decor' | 'office';
  dimensions: {
    width: number; // meters
    depth: number;
    height: number;
  };
  defaultColor: string;
  icon: string;
  description: string;
}

export const FURNITURE_CATALOG: CatalogAsset[] = [
  // Seating
  {
    id: 'sofa_3_seater',
    name: '3-Seater Modern Sofa',
    category: 'seating',
    dimensions: { width: 2.2, depth: 0.9, height: 0.8 },
    defaultColor: '#334155',
    icon: 'Armchair',
    description: 'Contemporary deep-cushion 3-seater sofa with wooden legs',
  },
  {
    id: 'armchair_lounge',
    name: 'Lounge Armchair',
    category: 'seating',
    dimensions: { width: 0.85, depth: 0.85, height: 0.78 },
    defaultColor: '#c29b68',
    icon: 'Armchair',
    description: 'Ergonomic accent armchair upholstered in warm leather',
  },
  {
    id: 'dining_chair',
    name: 'Dining Chair',
    category: 'seating',
    dimensions: { width: 0.5, depth: 0.52, height: 0.85 },
    defaultColor: '#1e293b',
    icon: 'Armchair',
    description: 'Minimalist dining chair with curved backrest',
  },
  {
    id: 'office_chair',
    name: 'Executive Task Chair',
    category: 'seating',
    dimensions: { width: 0.65, depth: 0.65, height: 1.1 },
    defaultColor: '#0f172a',
    icon: 'Armchair',
    description: 'Adjustable mesh office chair with 5-star swivel base',
  },

  // Tables
  {
    id: 'dining_table_6p',
    name: '6-Person Dining Table',
    category: 'tables',
    dimensions: { width: 1.8, depth: 0.9, height: 0.76 },
    defaultColor: '#5c4033',
    icon: 'Table',
    description: 'Solid walnut rectangular dining table',
  },
  {
    id: 'coffee_table_rect',
    name: 'Rectangular Coffee Table',
    category: 'tables',
    dimensions: { width: 1.2, depth: 0.6, height: 0.42 },
    defaultColor: '#e2d9cc',
    icon: 'Table',
    description: 'Low-profile architectural coffee table with stone top',
  },
  {
    id: 'work_desk',
    name: 'Architect Work Desk',
    category: 'office',
    dimensions: { width: 1.6, depth: 0.8, height: 0.75 },
    defaultColor: '#1e293b',
    icon: 'Laptop',
    description: 'Clean workstation desk with steel frame and oak surface',
  },
  {
    id: 'nightstand',
    name: 'Bedside Nightstand',
    category: 'storage',
    dimensions: { width: 0.5, depth: 0.45, height: 0.5 },
    defaultColor: '#5c4033',
    icon: 'Box',
    description: 'Compact 2-drawer wooden nightstand',
  },

  // Beds
  {
    id: 'bed_queen',
    name: 'Queen Size Platform Bed',
    category: 'beds',
    dimensions: { width: 1.6, depth: 2.1, height: 0.95 },
    defaultColor: '#e2e8f0',
    icon: 'Bed',
    description: 'Queen bed with upholstered headboard and integrated platform',
  },
  {
    id: 'bed_king',
    name: 'King Luxury Bed',
    category: 'beds',
    dimensions: { width: 1.95, depth: 2.15, height: 1.1 },
    defaultColor: '#334155',
    icon: 'BedDouble',
    description: 'Spacious master king bed with timber paneling',
  },

  // Storage
  {
    id: 'wardrobe_3door',
    name: '3-Door Wardrobe',
    category: 'storage',
    dimensions: { width: 1.8, depth: 0.6, height: 2.2 },
    defaultColor: '#f1f5f9',
    icon: 'DoorClosed',
    description: 'Full-height closet wardrobe with matte finish',
  },
  {
    id: 'bookshelf_tall',
    name: 'Open Architectural Bookshelf',
    category: 'storage',
    dimensions: { width: 1.0, depth: 0.35, height: 2.0 },
    defaultColor: '#1e293b',
    icon: 'Library',
    description: 'Industrial open bookshelf with 5 tiers',
  },

  // Kitchen
  {
    id: 'kitchen_counter_sink',
    name: 'Kitchen Sink Counter',
    category: 'kitchen',
    dimensions: { width: 1.8, depth: 0.65, height: 0.9 },
    defaultColor: '#f8fafc',
    icon: 'Utensils',
    description: 'Countertop unit with integrated stainless sink & faucet',
  },
  {
    id: 'kitchen_island',
    name: 'Kitchen Island with Bar',
    category: 'kitchen',
    dimensions: { width: 2.4, depth: 1.0, height: 0.92 },
    defaultColor: '#334155',
    icon: 'ChefHat',
    description: 'Waterfall marble kitchen island with overhang for stools',
  },
  {
    id: 'refrigerator_double',
    name: 'Double French-Door Fridge',
    category: 'kitchen',
    dimensions: { width: 0.9, depth: 0.75, height: 1.8 },
    defaultColor: '#94a3b8',
    icon: 'Refrigerator',
    description: 'Stainless steel high-capacity refrigerator',
  },

  // Bathroom
  {
    id: 'bath_vanity',
    name: 'Bathroom Vanity Unit',
    category: 'bathroom',
    dimensions: { width: 1.2, depth: 0.55, height: 0.85 },
    defaultColor: '#f1f5f9',
    icon: 'Bath',
    description: 'Wall-hung vanity with ceramic basin and chrome fixture',
  },
  {
    id: 'bathtub_freestanding',
    name: 'Freestanding Soaking Tub',
    category: 'bathroom',
    dimensions: { width: 1.7, depth: 0.8, height: 0.6 },
    defaultColor: '#ffffff',
    icon: 'Bath',
    description: 'Oval freestanding acrylic bath',
  },
  {
    id: 'toilet_wallhung',
    name: 'Wall-Hung Toilet',
    category: 'bathroom',
    dimensions: { width: 0.4, depth: 0.55, height: 0.45 },
    defaultColor: '#ffffff',
    icon: 'Bath',
    description: 'Concealed tank modern wall-mounted WC',
  },

  // Lighting & Decor
  {
    id: 'floor_lamp_arc',
    name: 'Arc Floor Lamp',
    category: 'lighting',
    dimensions: { width: 0.5, depth: 1.2, height: 2.1 },
    defaultColor: '#d4af37',
    icon: 'Lightbulb',
    description: 'Graceful brushed brass arched floor lamp with dome shade',
  },
  {
    id: 'potted_monstera',
    name: 'Indoor Monstera Plant',
    category: 'decor',
    dimensions: { width: 0.6, depth: 0.6, height: 1.2 },
    defaultColor: '#15803d',
    icon: 'Flower2',
    description: 'Large ceramic pot with lush tropical foliage',
  },
];
