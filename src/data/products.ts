export type Variant = "250g" | "500g" | "1kg";

export type RoastLevel = "Light" | "Medium" | "Medium-Dark" | "Dark";
export type Process = "Washed" | "Natural";

export interface Product {
  slug: string;
  name: string;
  shortNote: string;
  description: string;
  flavorNotes: string[];
  roast: RoastLevel;
  process: Process;
  brewRecommendations: string[];
  origin: string;
  prices: Record<Variant, number>; // NPR
  stock: Record<Variant, number>;
  active: boolean;
  featured: boolean;
}

export const seedProducts: Product[] = [
  {
    slug: "himalayan-sunrise",
    name: "Himalayan Sunrise",
    shortNote: "Bright, citrus-forward, with a clean honey finish.",
    description:
      "A delicate light roast from the high terraces of eastern Nepal. Picked at peak ripeness and washed slowly to preserve clarity.",
    flavorNotes: ["Lemon zest", "Honey", "Jasmine"],
    roast: "Light",
    process: "Washed",
    brewRecommendations: ["V60", "Chemex", "Aeropress"],
    origin: "Ilam, Nepal",
    prices: { "250g": 850, "500g": 1600, "1kg": 3000 },
    stock: { "250g": 24, "500g": 18, "1kg": 8 },
    active: true,
    featured: true,
  },
  {
    slug: "monastery-blend",
    name: "Monastery Blend",
    shortNote: "Smooth chocolate body with a soft caramel sweetness.",
    description:
      "Our signature medium roast — balanced, comforting, and forgiving across brew methods. The everyday cup we drink ourselves.",
    flavorNotes: ["Milk chocolate", "Caramel", "Almond"],
    roast: "Medium",
    process: "Washed",
    brewRecommendations: ["French press", "Drip", "Moka pot"],
    origin: "Gulmi, Nepal",
    prices: { "250g": 750, "500g": 1400, "1kg": 2600 },
    stock: { "250g": 40, "500g": 32, "1kg": 15 },
    active: true,
    featured: true,
  },
  {
    slug: "annapurna-natural",
    name: "Annapurna Natural",
    shortNote: "Wild berry sweetness with a wine-like finish.",
    description:
      "Sun-dried on raised beds for 18 days. A natural process coffee that drinks like ripe summer fruit.",
    flavorNotes: ["Strawberry", "Red wine", "Cocoa"],
    roast: "Medium",
    process: "Natural",
    brewRecommendations: ["V60", "Aeropress", "Cold brew"],
    origin: "Kaski, Nepal",
    prices: { "250g": 950, "500g": 1800, "1kg": 3400 },
    stock: { "250g": 16, "500g": 10, "1kg": 4 },
    active: true,
    featured: true,
  },
  {
    slug: "espresso-noir",
    name: "Espresso Noir",
    shortNote: "Deep, syrupy and bold — built for milk drinks.",
    description:
      "A dark roast crafted for espresso. Heavy body, low acidity, and a long lingering finish.",
    flavorNotes: ["Dark chocolate", "Toasted hazelnut", "Brown sugar"],
    roast: "Dark",
    process: "Washed",
    brewRecommendations: ["Espresso", "Moka pot"],
    origin: "Sindhupalchok, Nepal",
    prices: { "250g": 800, "500g": 1500, "1kg": 2800 },
    stock: { "250g": 30, "500g": 22, "1kg": 12 },
    active: true,
    featured: true,
  },
  {
    slug: "valley-decaf",
    name: "Valley Decaf",
    shortNote: "Sugar-water decaf — all the flavor, none of the buzz.",
    description:
      "Swiss-water processed to remove caffeine while preserving the cup. Round, sweet and chocolatey.",
    flavorNotes: ["Cocoa", "Raisin", "Vanilla"],
    roast: "Medium-Dark",
    process: "Washed",
    brewRecommendations: ["Drip", "French press", "Espresso"],
    origin: "Lalitpur, Nepal",
    prices: { "250g": 900, "500g": 1700, "1kg": 3200 },
    stock: { "250g": 12, "500g": 8, "1kg": 3 },
    active: true,
    featured: false,
  },
  {
    slug: "harvest-reserve",
    name: "Harvest Reserve",
    shortNote: "Limited micro-lot — floral, complex, layered.",
    description:
      "A small reserve lot from a single farm. Hand-sorted and slow-roasted in batches of 4kg. While stocks last.",
    flavorNotes: ["Bergamot", "Peach", "Brown sugar"],
    roast: "Light",
    process: "Natural",
    brewRecommendations: ["V60", "Chemex"],
    origin: "Sindhuli, Nepal",
    prices: { "250g": 1200, "500g": 2300, "1kg": 4400 },
    stock: { "250g": 6, "500g": 4, "1kg": 2 },
    active: true,
    featured: true,
  },
];
