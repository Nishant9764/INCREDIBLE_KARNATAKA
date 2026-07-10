import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Place } from "@/models/Place";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    const query =
      q.length < 2
        ? {}
        : {
            $or: [
              {
                name: {
                  $regex: q,
                  $options: "i",
                },
              },
              {
                city: {
                  $regex: q,
                  $options: "i",
                },
              },
              {
                district: {
                  $regex: q,
                  $options: "i",
                },
              },
              { address: { $regex: q, $options: "i" } },
            ],
          };

    const places = await Place.find(query)
      .select("_id name city district state category thumbnailUrl location")
      .sort({ name: 1 })
      .limit(15)
      .lean();

    return apiSuccess({ places });
  } catch (err) {
    console.error(err);
    return apiError("Failed to search places", 500);
  }
}
