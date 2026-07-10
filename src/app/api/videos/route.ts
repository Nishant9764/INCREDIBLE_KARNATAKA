import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Video } from "@/models/Video";
import { Place } from "@/models/Place";
import "@/models/User";
import { getAuthUser } from "@/lib/auth/jwt";
import { apiError, apiSuccess } from "@/lib/utils";
import { FEED_PAGE_SIZE } from "@/constants";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || FEED_PAGE_SIZE);

    const category = searchParams.get("category");

    const placeId = searchParams.get("placeId");

    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      status: "APPROVED",
    };

    if (category) query.category = category;

    if (placeId) query.placeId = placeId;

    const [videos, total] = await Promise.all([
      Video.find(query)
        .populate({
          path: "placeId",
          select: "_id name city district state category thumbnailUrl location",
        })
        .populate({
          path: "creatorId",
          select: "fullName profileImage district isVerified",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Video.countDocuments(query),
    ]);

    return apiSuccess({
      videos,
      total,
      page,
      limit,
      hasMore: skip + videos.length < total,
    });
  } catch (err) {
    console.error(err);
    return apiError("Failed to load videos", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser();

    if (!user) return apiError("Not authenticated", 401);

    if (user.role !== "CREATOR")
      return apiError("Only creators can upload videos", 403);

    const body = await req.json();

    const {
      title,
      description,
      category,
      tags,

      placeId,

      newPlace,

      videoUrl,
      youtubeUrl,
      thumbnailUrl,
      cloudinaryPublicId,
    } = body;

    if (!title) return apiError("Title is required", 400);

    if (!category) return apiError("Category is required", 400);

    if (!videoUrl && !youtubeUrl) return apiError("Video URL is required", 400);

    let finalPlaceId = placeId;

    if (!finalPlaceId) {
      if (!newPlace) return apiError("Place is required", 400);

      const existingPlace = await Place.findOne({
        name: newPlace.name.trim(),
        city: newPlace.city,
      });

      if (existingPlace) {
        finalPlaceId = existingPlace._id;
      } else {
        const createdPlace = await Place.create({
          name: newPlace.name.trim(),
          address: newPlace.address,
          district: newPlace.district,
          city: newPlace.city,
          state: newPlace.state || "Karnataka",
          category: newPlace.category,
          description: newPlace.description,
          thumbnailUrl,
          createdBy: user.id,

          location: {
            type: "Point",
            coordinates: [newPlace.location.lng, newPlace.location.lat],
          },
        });

        finalPlaceId = createdPlace._id;
      }
    }

    const video = await Video.create({
      title: title.trim(),

      description,

      category,

      tags: tags || [],

      placeId: finalPlaceId,

      source: youtubeUrl ? "YOUTUBE" : "UPLOAD",

      youtubeUrl,

      videoUrl,

      thumbnailUrl,

      cloudinaryPublicId,

      creatorId: user.id,

      status: "PENDING",
    });

    return apiSuccess({ video }, "Video submitted successfully", 201);
  } catch (err) {
    console.error(err);
    return apiError("Failed to upload video", 500);
  }
}
