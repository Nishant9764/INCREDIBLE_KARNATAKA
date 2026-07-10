import mongoose, { Schema } from "mongoose";

const VideoSchema = new Schema(
  {
    // Basic Details
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      maxlength: 500,
      default: "",
    },

    category: {
      type: String,
      enum: [
        "NATURE",
        "HERITAGE",
        "FOOD",
        "TREKKING",
        "WATERFALL",
        "CULTURE",
        "HIDDEN_GEM",
        "TEMPLE",
        "BEACH",
        "WILDLIFE",
        "RESTAURANT",
      ],
      required: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Linked Place
    placeId: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      required: true,
      index: true,
    },

    // Upload Source
    source: {
      type: String,
      enum: ["UPLOAD", "YOUTUBE"],
      required: true,
    },

    // URLs
    youtubeUrl: String,

    videoUrl: String,

    thumbnailUrl: String,

    cloudinaryPublicId: String,

    // Duration (seconds)
    duration: {
      type: Number,
      default: 0,
    },

    // Creator
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Moderation
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    rejectionReason: String,

    // Analytics
    views: {
      type: Number,
      default: 0,
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    sharesCount: {
      type: Number,
      default: 0,
    },

    savesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

VideoSchema.index({ status: 1, createdAt: -1 });

VideoSchema.index({ creatorId: 1, status: 1 });

VideoSchema.index({ placeId: 1, status: 1 });

VideoSchema.index({ category: 1, status: 1 });

export const Video =
  mongoose.models.Video ||
  mongoose.model("Video", VideoSchema);