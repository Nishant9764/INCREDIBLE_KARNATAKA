import mongoose, { Schema } from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// 1. Schema Definition
const PlaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    address: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, default: "Karnataka", trim: true },
    category: {
      type: String,
      enum: [
        "RESTAURANT",
        "CAFE",
        "STREET FOOD",
        "BAR",
        "NATURE",
        "HERITAGE",
        "TEMPLE",
        "BEACH",
        "WILDLIFE",
        "OTHER",
      ],
      default: "OTHER",
    },
    description: { type: String, maxlength: 500 },
    location: {
      type: { type: String, enum: ["Point"], required: true, default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    thumbnailUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "APPROVED",
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Geo queries
PlaceSchema.index({ location: "2dsphere" });

// Fast search
PlaceSchema.index({ name: "text", city: "text", district: "text" });

// Prevent duplicate places in same city
PlaceSchema.index({ name: 1, city: 1 }, { unique: true });

const Place = mongoose.models.Place || mongoose.model("Place", PlaceSchema);

// 2. Full Seed Data (Syntax errors fixed)
const SEED_PLACES = [
  // --- ANDHRA PRADESH ---
  {
    name: "Thatha Rao Sweets",
    address: "Fort Road, Police Quarters",
    district: "Krishna",
    city: "Machilipatnam",
    state: "Andhra Pradesh",
    category: "STREET FOOD",
    description:
      "Iconic sweet shop established in 1951, famous for its authentic Bunder Laddu, Wheat Halwa, and Kaju Mithai.",
    location: { type: "Point", coordinates: [81.1416, 16.1808] },
    thumbnailUrl: "i.ytimg.com/vi/…/hqdefault.jpg",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "RK Paradise",
    address: "English Palem, Opp Bus Stand",
    district: "Krishna",
    city: "Machilipatnam",
    state: "Andhra Pradesh",
    category: "RESTAURANT",
    description:
      "Popular restaurant famous for its Andhra Meals, crumb-fried prawns, and unique delicacies like Kaju Fish Halwa.",
    location: { type: "Point", coordinates: [81.1332, 16.177] },
    thumbnailUrl: "i.ytimg.com/vi/…/hqdefault.jpg",
    status: "APPROVED",
    isVerified: true,
  },
  // --- KARNATAKA HOMP & CLASSICS ---
  {
    name: "Vidyarthi Bhavan",
    address: "Gandhi Bazaar, Basavanagudi",
    district: "Bengaluru Urban",
    city: "Bengaluru",
    state: "Karnataka",
    category: "RESTAURANT",
    description:
      "A legendary heritage eatery operating since 1943. Famous for crispy, thick Masala Dosas.",
    location: { type: "Point", coordinates: [77.5712, 12.9431] },
    thumbnailUrl:
      "images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&…",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Giri Manja's",
    address: "Bhavathi, Bunder",
    district: "Dakshina Kannada",
    city: "Mangalore",
    state: "Karnataka",
    category: "RESTAURANT",
    description:
      "Tucked away in a small house, this legendary spot serves some of the best Anjal fry and coastal seafood.",
    location: { type: "Point", coordinates: [74.8354, 12.8703] },
    thumbnailUrl: "i.ytimg.com/vi/…/hqdefault.jpg",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Amrut Hotel",
    address: "Main Road, near Geethanjali Talkies",
    district: "Uttara Kannada",
    city: "Karwar",
    state: "Karnataka",
    category: "RESTAURANT",
    description:
      "A decades-old institution in Karwar. Famous for fiery crab masala and signature Karwar-style seafood.",
    location: { type: "Point", coordinates: [74.1315, 14.8143] },
    thumbnailUrl: "i.ytimg.com/vi/…/hqdefault.jpg",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Mitra Samaj",
    address: "Car Street, Near Krishna Temple",
    district: "Udupi",
    city: "Udupi",
    state: "Karnataka",
    category: "RESTAURANT",
    description:
      "The birthplace of authentic Udupi cuisine. Known for strict sattvic food, Goli Baje, and legendary Masala Dosa.",
    location: { type: "Point", coordinates: [74.7431, 13.3392] },
    thumbnailUrl: "i.ytimg.com/vi/…/hqdefault.jpg",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "MTR (Mavalli Tiffin Room)",
    address: "Lalbagh Road",
    district: "Bengaluru Urban",
    city: "Bengaluru",
    state: "Karnataka",
    category: "CAFE",
    description:
      "Legendary restaurant near Lalbagh founded in 1924, famous for authentic Rava Idli, Masala Dosa.",
    location: { type: "Point", coordinates: [77.5855, 12.9566] },
    thumbnailUrl:
      "images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&…",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Mylari Hotel (Original)",
    address: "Nazarbad Main Road",
    district: "Mysuru",
    city: "Mysuru",
    state: "Karnataka",
    category: "RESTAURANT",
    description:
      "Iconic eatery serving the famous melt-in-mouth Mylari dosa with a dollop of butter since the 1940s.",
    location: { type: "Point", coordinates: [76.6631, 12.3102] },
    thumbnailUrl:
      "images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&…",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Mysore Palace",
    address: "Sayyaji Rao Rd, Agrahara",
    district: "Mysuru",
    city: "Mysuru",
    state: "Karnataka",
    category: "HERITAGE",
    description:
      "A historical palace and a royal residence. It is the official residence of the Wadiyar dynasty.",
    location: { type: "Point", coordinates: [76.6552, 12.3051] },
    thumbnailUrl:
      "images.unsplash.com/photo-1600014798606-f6406e41b9c9?auto=format&fit=crop&…",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Jog Falls",
    address: "Sagara Taluk",
    district: "Shivamogga",
    city: "Sagara",
    state: "Karnataka",
    category: "NATURE",
    description:
      "The second-highest plunge waterfall in India, created by the Sharavathi River dropping 253 meters.",
    location: { type: "Point", coordinates: [74.8166, 14.229] },
    thumbnailUrl:
      "images.unsplash.com/photo-1627896472477-8d02c89dbd17?auto=format&fit=crop&…",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Gokarna Om Beach",
    address: "Om Beach Road",
    district: "Uttara Kannada",
    city: "Gokarna",
    state: "Karnataka",
    category: "BEACH",
    description:
      "Famous for its Om shape, this pristine beach offers water sports, beachside cafes, and stunning sunset views.",
    location: { type: "Point", coordinates: [74.3188, 14.5186] },
    thumbnailUrl:
      "images.unsplash.com/photo-1590226343360-1436eb46ef27?auto=format&fit=crop&…",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Bandipur National Park",
    address: "NH 67, Hangala Village",
    district: "Chamarajanagar",
    city: "Bandipur",
    state: "Karnataka",
    category: "WILDLIFE",
    description:
      "One of India's best tiger reserves. Offers thrilling safaris through lush forests teeming with elephants.",
    location: { type: "Point", coordinates: [76.6267, 11.6669] },
    thumbnailUrl:
      "images.unsplash.com/photo-1574768396010-863a8a30a7d5?auto=format&fit=crop&…",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Murudeshwar Temple",
    address: "Murdeshwar Temple Highway",
    district: "Uttara Kannada",
    city: "Murudeshwar",
    state: "Karnataka",
    category: "TEMPLE",
    description:
      "Home to the world's second tallest Shiva statue, situated beautifully on a small hillock overlooking the Arabian Sea.",
    location: { type: "Point", coordinates: [74.4851, 14.094] },
    thumbnailUrl:
      "images.unsplash.com/photo-1580132338692-0b8109bfcebe?auto=format&fit=crop&…",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Hampi Ruins",
    address: "Hampi",
    district: "Vijayanagara",
    city: "Hampi",
    state: "Karnataka",
    category: "HERITAGE",
    description:
      "UNESCO World Heritage Site containing the ruins of the magnificent ancient city of the Vijayanagara Empire.",
    location: { type: "Point", coordinates: [76.46, 15.335] },
    thumbnailUrl:
      "images.unsplash.com/photo-1620766165457-a80fe592170d?auto=format&fit=crop&…",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Kayani Bakery",
    address: "East Street, Camp",
    district: "Pune",
    city: "Pune",
    state: "Maharashtra",
    category: "CAFE",
    description:
      "A Pune institution famous for its Shrewsbury biscuits, Mawa cakes, and old-world Parsi bakery charm.",
    location: { type: "Point", coordinates: [73.8773, 18.5147] },
    thumbnailUrl: "i.ytimg.com/vi/…/hqdefault.jpg",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Mahesh Lunch Home",
    address: "Fort, Flora Fountain",
    district: "Mumbai City",
    city: "Mumbai",
    state: "Maharashtra",
    category: "RESTAURANT",
    description:
      "One of Mumbai's most iconic spots for Mangalorean seafood, famous for its Butter Garlic Crab.",
    location: { type: "Point", coordinates: [72.8335, 18.9341] },
    thumbnailUrl: "i.ytimg.com/vi/…/hqdefault.jpg",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Britto's",
    address: "Baga Beach",
    district: "North Goa",
    city: "Baga",
    state: "Goa",
    category: "RESTAURANT",
    description:
      "A legendary beach shack serving iconic Goan vindaloo, seafood platters, and decadent desserts right on the sand.",
    location: { type: "Point", coordinates: [73.755, 15.5645] },
    thumbnailUrl: "i.ytimg.com/vi/HSnRBnCJdBY/hqdefault.jpg",
    status: "APPROVED",
    isVerified: true,
  },
  {
    name: "Paragon Restaurant",
    address: "Kannur Road",
    district: "Kozhikode",
    city: "Kozhikode",
    state: "Kerala",
    category: "RESTAURANT",
    description:
      "Globally recognized for its incredible Malabar Biryani, flaky parottas, and intense mutton curries.",
    location: { type: "Point", coordinates: [75.7766, 11.2588] },
    thumbnailUrl: "i.ytimg.com/vi/…/hqdefault.jpg",
    status: "APPROVED",
    isVerified: true,
  },
];

// 3. Script Execution
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);

    console.log("Connected. Clearing existing places...");
    await Place.deleteMany({});

    console.log(`Inserting ${SEED_PLACES.length} curated places...`);
    await Place.insertMany(SEED_PLACES);

    console.log("Seed complete! Run 'npm run dev' and visit the map page.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
