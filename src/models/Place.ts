import mongoose, { Schema } from "mongoose";

const PlaceSchema = new Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    address: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      default: "Karnataka",
      trim: true,
    },

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

    description: {
      type: String,
      maxlength: 500,
    },

    // GeoJSON
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // Cover Image
    thumbnailUrl: {
      type: String,
    },

    // Creator
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // Admin moderation
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "APPROVED",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Geo queries
PlaceSchema.index({ location: "2dsphere" });

// Fast search
PlaceSchema.index({
  name: "text",
  city: "text",
  district: "text",
});

// Prevent duplicate places in same city
PlaceSchema.index(
  {
    name: 1,
    city: 1,
  },
  {
    unique: true,
  }
);

export const Place =
  mongoose.models.Place ||
  mongoose.model("Place", PlaceSchema);