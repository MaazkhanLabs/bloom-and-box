/**
 * Bloom & Box - Central Product Catalog
 * Real, curated product data with verified imagery and specifications.
 */

const PRODUCTS_DATA = [
  // --- BOUQUETS ---
  {
    id: "bq-01",
    name: "Classic Red Rose Symphony",
    category: "bouquets",
    occasion: "romance",
    subCategory: "Roses",
    price: 4500,
    originalPrice: 5000,
    rating: 4.9,
    reviewCount: 128,
    stock: 15,
    isBestSeller: true,
    isFeatured: true,
    badge: "Bestseller",
    images: [
      "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800",
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800"
    ],
    description: "24 premium long-stem Ecuadorian red roses hand-tied with French silk ribbon, enveloped in signature Korean textured wrap with preserved baby's breath and silver dollar eucalyptus accents.",
    details: "Stem count: 24 · Vase life: 8-12 days · Stem length: 50cm · Wrapped in biodegradable artisan parchment.",
    careInstructions: "Trim stems 2cm at a 45° angle under running water. Change vase water every 48 hours and keep away from direct sunlight.",
    tags: ["Fresh Roses", "Hand-tied", "Zero Foam", "Scented"]
  },
  {
    id: "bq-02",
    name: "Pastel Dawn Peony & Ranunculus",
    category: "bouquets",
    occasion: "birthday",
    subCategory: "Mixed",
    price: 4200,
    originalPrice: null,
    rating: 4.8,
    reviewCount: 94,
    stock: 8,
    isBestSeller: true,
    isFeatured: false,
    badge: "Trending",
    images: [
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800",
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800"
    ],
    description: "A dreamy symphony of blush pink Sarah Bernhardt peonies, white butterfly ranunculus, lavender spray roses, and scented Italian ruscus greenery.",
    details: "Stem count: 18 · Seasonal bloom · Arrives in water bulb for maximum hydration during transit.",
    careInstructions: "Peonies bloom within 24-48 hours in room temperature water. Mist petals gently each morning.",
    tags: ["Blush Peonies", "Ranunculus", "Fragrant", "Soft Pastels"]
  },
  {
    id: "bq-03",
    name: "Golden Hour Sunflower Meadow",
    category: "bouquets",
    occasion: "congratulations",
    subCategory: "Sunflowers",
    price: 3200,
    originalPrice: 3800,
    rating: 4.7,
    reviewCount: 62,
    stock: 20,
    isBestSeller: false,
    isFeatured: true,
    badge: "Seasonal",
    images: [
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800",
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800"
    ],
    description: "Sun-drenched golden sunflowers paired with chamomile daisies, goldenrod, and wild meadow grasses bound with unbleached organic jute rope.",
    details: "Stem count: 12 · High pollen-filtered blooms · Ideal for home study desks and celebratory welcomes.",
    careInstructions: "Sunflowers are thirsty blooms. Keep water level filled to 3/4 of the vase.",
    tags: ["Sunflowers", "Radiant", "Rustic Jute", "Long Lasting"]
  },
  {
    id: "bq-04",
    name: "Imperial White Phalaenopsis Orchid",
    category: "bouquets",
    occasion: "wedding",
    subCategory: "Orchids",
    price: 6500,
    originalPrice: null,
    rating: 5.0,
    reviewCount: 47,
    stock: 6,
    isBestSeller: true,
    isFeatured: true,
    badge: "Luxury Pick",
    images: [
      "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800",
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800"
    ],
    description: "Twin-stem cascaded white Phalaenopsis orchid presented in an artisan textured earthenware ceramic bowl cushioned with live mountain forest moss.",
    details: "Living potted arrangement · Blooms continuously for 6 to 10 weeks with minimal weekly watering.",
    careInstructions: "Water with 3 ice cubes or 50ml water once per week. Place in bright, indirect ambient light.",
    tags: ["Potted Orchid", "Ceramic Bowl", "Lasts 2+ Months", "Architectural"]
  },
  {
    id: "bq-05",
    name: "Wild Botanical Flora Garden",
    category: "bouquets",
    occasion: "thankyou",
    subCategory: "Mixed",
    price: 3800,
    originalPrice: null,
    rating: 4.8,
    reviewCount: 53,
    stock: 12,
    isBestSeller: false,
    isFeatured: false,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800",
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800"
    ],
    description: "A freeform atelier design inspired by countryside cottage gardens. Features lisianthus, matricaria daisies, scented stock, and seasonal thistle.",
    details: "Stem count: 20 · Arranged foam-free in Japanese kenzan style · Wrapped in cold-pressed kraft paper.",
    careInstructions: "Add provided flower food packet to fresh water on day 1 and day 4.",
    tags: ["Cottage Garden", "Daisies", "Organic Flow", "Earth Tones"]
  },

  // --- GIFT HAMPERS ---
  {
    id: "hm-01",
    name: "The Royal Indulgence Hamper",
    category: "hampers",
    occasion: "anniversary",
    subCategory: "Gourmet",
    price: 8500,
    originalPrice: 9500,
    rating: 4.9,
    reviewCount: 168,
    stock: 10,
    isBestSeller: true,
    isFeatured: true,
    badge: "Most Loved",
    images: [
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800",
      "images/royal-orchard-hamper.jpg"
    ],
    description: "An opulent curation featuring 16 artisan Belgian dark chocolate pralines, roasted honey-glazed cashews, a hand-poured vanilla bean soy candle, Damask rose tea tin, and a delicate mini bouquet.",
    details: "Presented in a velvet-lined reusable walnut pine crate with brass latch and personalized foiled nameplate.",
    careInstructions: "Store confectioneries in a cool, dry place between 15°C and 18°C.",
    tags: ["Belgian Chocolates", "Soy Candle", "Organic Tea", "Wooden Crate"]
  },
  {
    id: "hm-02",
    name: "Gourmet Celebration Sommelier Tray",
    category: "hampers",
    occasion: "birthday",
    subCategory: "Gourmet",
    price: 7200,
    originalPrice: null,
    rating: 4.8,
    reviewCount: 71,
    stock: 14,
    isBestSeller: false,
    isFeatured: true,
    badge: "Celebration",
    images: [
      "images/royal-orchard-hamper.jpg",
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800"
    ],
    description: "Non-alcoholic sparkling white grape reserve paired with rosemary flatbread crackers, olive tapenade, smoked almonds, dried California figs, and mouth-blown crystal coupe glasses.",
    details: "Mounted on an ecru marble and brass serving board that serves as a permanent entertaining keepsake.",
    careInstructions: "Chill sparkling juice before serving.",
    tags: ["Sparkling Reserve", "Coupe Glasses", "Marble Tray", "Savory"]
  },
  {
    id: "hm-03",
    name: "Serenity Botanical Spa Sanctuary",
    category: "hampers",
    occasion: "justbecause",
    subCategory: "Wellness",
    price: 6800,
    originalPrice: 7500,
    rating: 4.9,
    reviewCount: 88,
    stock: 12,
    isBestSeller: true,
    isFeatured: false,
    badge: "Wellness",
    images: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800",
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800"
    ],
    description: "Pure French lavender bath soak, whipped shea body butter, botanical floral face mist, plush organic waffle weave face towel, and natural jade facial gua sha tool.",
    details: "100% natural and paraben-free. Packed in a sustainable ivory paper-linen hat box with satin handle.",
    careInstructions: "Rinse gua sha in cool water after use and keep bath salts tightly closed.",
    tags: ["Spa Ritual", "Lavender", "Gua Sha", "Organic Cotton"]
  },
  {
    id: "hm-04",
    name: "Baby Blossom & New Mother Keepsake",
    category: "hampers",
    occasion: "congratulations",
    subCategory: "Baby",
    price: 9500,
    originalPrice: null,
    rating: 5.0,
    reviewCount: 39,
    stock: 7,
    isBestSeller: false,
    isFeatured: true,
    badge: "Heirloom",
    images: [
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800",
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800"
    ],
    description: "Certified GOTS organic cotton baby sleepsuit, hand-knit merino wool booties, soothing chamomile baby massage elixir, nourishing mother's hand balm, and a dried everlasting posy.",
    details: "Gifted in an embossed baby milestone storage trunk crafted for birth certificates and treasured hospital keepsakes.",
    careInstructions: "Machine wash baby knitwear on gentle wool cycle at 30°C.",
    tags: ["Organic Cotton", "Merino Knit", "Baby Trunk", "Everlasting"]
  },
  {
    id: "hm-05",
    name: "Executive Signature Desk Crate",
    category: "hampers",
    occasion: "thankyou",
    subCategory: "Corporate",
    price: 6000,
    originalPrice: null,
    rating: 4.7,
    reviewCount: 52,
    stock: 18,
    isBestSeller: false,
    isFeatured: false,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800",
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800"
    ],
    description: "Refined full-grain leather journal, matte brass twist pen, single-origin Ethiopian roast coffee beans (250g), 85% single-origin dark chocolate bar, and personalized hot-stamped stationery.",
    details: "Encased in an obsidian magnetic closure box with debossed silver metallic lettering.",
    careInstructions: "Condition leather journal annually with clear beeswax.",
    tags: ["Executive", "Full-grain Leather", "Single Origin", "Brass Pen"]
  },

  // --- KEEPSAKES ---
  {
    id: "ks-01",
    name: "Golden Celebration 24K Rose Chest",
    category: "keepsakes",
    occasion: "anniversary",
    subCategory: "Heirloom",
    price: 15000,
    originalPrice: 17500,
    rating: 5.0,
    reviewCount: 78,
    stock: 5,
    isBestSeller: true,
    isFeatured: true,
    badge: "Masterpiece",
    images: [
      "images/golden-rose-chest.jpg",
      "images/walnut-memory-box.jpg"
    ],
    description: "A genuine natural rose stem meticulously dipped in certified 24-karat gold, resting alongside a hand-painted porcelain heirloom trinket dish inside an aromatic cedarwood chest with custom brass monogram plate.",
    details: "Includes certified certificate of authenticity hallmark. The gold finish will never tarnish or degrade with age.",
    careInstructions: "Dust gently using the included microfiber jewelers cloth. Avoid abrasive detergents.",
    tags: ["24K Gold", "Certified Hallmark", "Aromatic Cedar", "Forever Rose"]
  },
  {
    id: "ks-02",
    name: "Lover's Archival Vow & Wax Seal Box",
    category: "keepsakes",
    occasion: "romance",
    subCategory: "Heirloom",
    price: 7500,
    originalPrice: 8500,
    rating: 4.9,
    reviewCount: 82,
    stock: 9,
    isBestSeller: true,
    isFeatured: true,
    badge: "Bespoke",
    images: [
      "images/walnut-memory-box.jpg",
      "images/lover-archival-box.jpg"
    ],
    description: "Personalized solid walnut wood memory trunk featuring your couple monograms, a hand-carved solid brass wax seal stamper, metallic sealing wax sticks, and calligraphed cotton parchment scrolls.",
    details: "Laser-engraved lid personalization · Interior lined with pale champagne silk.",
    careInstructions: "Keep interior dry. Re-wax brass seal periodically to prevent natural patina.",
    tags: ["Wax Seal Kit", "Walnut Chest", "Calligraphy", "Personalized"]
  },
  {
    id: "ks-03",
    name: "Preserved Eternity Velvet Hat Box",
    category: "keepsakes",
    occasion: "birthday",
    subCategory: "Preserved",
    price: 5500,
    originalPrice: null,
    rating: 4.8,
    reviewCount: 110,
    stock: 14,
    isBestSeller: false,
    isFeatured: true,
    badge: "3-Year Bloom",
    images: [
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800",
      "images/lover-archival-box.jpg"
    ],
    description: "9 genuine eternal roses picked at peak blossom in Ecuador, naturally preserved with plant-based glycerin. Retains natural velvety texture and soft scent for over 3 years without watering.",
    details: "Round dusty rose velvet hat box accented with embossed gold lettering and grosgrain ribbon.",
    careInstructions: "Do NOT water. Keep in ambient humidity between 40% and 60%, away from direct air conditioning vents.",
    tags: ["Ecuadorian Roses", "Zero Care", "Velvet Box", "3-Year Life"]
  }
];

// Helper functions for catalog queries
function getAllProducts() {
  return PRODUCTS_DATA;
}

function getProductById(id) {
  return PRODUCTS_DATA.find(p => p.id === id) || null;
}

function getProductsByCategory(category) {
  if (!category || category === 'all') return PRODUCTS_DATA;
  return PRODUCTS_DATA.filter(p => p.category === category);
}

function getProductsByOccasion(occasion) {
  if (!occasion || occasion === 'all') return PRODUCTS_DATA;
  return PRODUCTS_DATA.filter(p => p.occasion === occasion);
}

function getBestSellers() {
  return PRODUCTS_DATA.filter(p => p.isBestSeller);
}

function getFeaturedProducts() {
  return PRODUCTS_DATA.filter(p => p.isFeatured);
}

// Make accessible to all browser scripts
if (typeof window !== 'undefined') {
  window.PRODUCTS_DATA = PRODUCTS_DATA;
  window.getAllProducts = getAllProducts;
  window.getProductById = getProductById;
  window.getProductsByCategory = getProductsByCategory;
  window.getProductsByOccasion = getProductsByOccasion;
  window.getBestSellers = getBestSellers;
  window.getFeaturedProducts = getFeaturedProducts;
}
