"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

import Image from "next/image";

import {
  X,
  MapPin,
  Navigation,
  Bookmark,
  Share2,
  ExternalLink,
  Play,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import type { IPlace, IVideo } from "@/types";
import { CATEGORY_EMOJI, PLACE_CATEGORIES } from "./constants";

interface PlaceBottomSheetProps {
  place: IPlace | null;
  userCoords: {
    lat: number;
    lng: number;
  } | null;
  onClose: () => void;
  onOpenInMaps: (place: IPlace) => void;
  onWatchVideos: (video: IVideo) => void;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return (
    Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10
  );
}

const DESCRIPTION_LIMIT = 170;

export function PlaceBottomSheet({
  place,
  userCoords,
  onClose,
  onOpenInMaps,
  onWatchVideos,
}: PlaceBottomSheetProps) {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const dragOffset = useRef(0);

  // Reset per-place UI state (expanded description, saved toggle, videos)
  // every time the selected place changes — including switching directly
  // from one place to another without closing the sheet.
  useEffect(() => {
    setExpanded(false);
    setSaved(false);

    if (!place) {
      setVideos([]);
      setLoadingVideos(false);
      return;
    }

    let cancelled = false;
    setLoadingVideos(true);
    setVideos([]);

    fetch(`/api/places/${place._id}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.success) {
          setVideos(d.data.videos ?? []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingVideos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [place]);

  const category = useMemo(() => {
    return PLACE_CATEGORIES.find((c) => c.value === place?.category);
  }, [place]);

  const emoji = CATEGORY_EMOJI[place?.category || "OTHER"] || "📍";

  const distance = useMemo(() => {
    if (!place) return null;

    const [lng, lat] = place.location.coordinates;

    if (userCoords) {
      return calculateDistance(userCoords.lat, userCoords.lng, lat, lng);
    }

    return place.distanceKm ?? null;
  }, [place, userCoords]);

  const description = useMemo(() => {
    if (!place?.description) return "";

    if (expanded || place.description.length <= DESCRIPTION_LIMIT) {
      return place.description;
    }

    return place.description.slice(0, DESCRIPTION_LIMIT) + "...";
  }, [expanded, place]);

  const handleShare = useCallback(async () => {
    if (!place) return;

    const url = `${window.location.origin}/map?placeId=${place._id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: place.name,
          text: place.name,
          url,
        });
      } else {
        navigator.clipboard.writeText(url);
      }
    } catch {}
  }, [place]);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientY;

    if (sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart.current == null) return;

    const diff = e.touches[0].clientY - dragStart.current;

    if (diff < 0) return;

    dragOffset.current = diff;

    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (sheetRef.current) {
      sheetRef.current.style.transition =
        "all .35s cubic-bezier(.22,.61,.36,1)";
      sheetRef.current.style.transform = "";
    }

    if (dragOffset.current > 140) {
      onClose();
    }

    dragOffset.current = 0;
    dragStart.current = null;
  };

  if (!place) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      >
        <motion.div
          ref={sheetRef}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="absolute bottom-0 left-0 right-0 rounded-t-[34px] overflow-hidden bg-[#101114] border-t border-white/10 shadow-[0_-20px_80px_rgba(0,0,0,.65)]"
          style={{ maxHeight: "90dvh" }}
        >
          {/* drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 rounded-full bg-white/20" />
          </div>

          {/* close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-40 w-11 h-11 rounded-full backdrop-blur-xl bg-black/35 border border-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="overflow-y-auto" style={{ maxHeight: "90dvh" }}>
            {/* ================= HERO ================= */}
            {/* ================= HERO ================= */}

<div className="relative h-[280px]">
  {(() => {
    const imageUrl =
      place.thumbnailUrl &&
      place.thumbnailUrl.trim() !== ""
        ? place.thumbnailUrl.startsWith("http")
          ? place.thumbnailUrl
          : `https://${place.thumbnailUrl}`
        : null;

    return imageUrl ? (
      <Image
        src={imageUrl}
        alt={place.name}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        unoptimized
      />
    ) : (
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center text-white/50">
          <span className="text-6xl mb-3">{emoji}</span>
          <span className="text-sm font-medium">
            No Image Available
          </span>
        </div>
      </div>
    );
  })()}

  {/* Dark Overlays */}

  <div className="absolute inset-0 bg-gradient-to-t from-[#101114] via-black/40 to-black/10" />

  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

  {/* Category Badge */}

  {category && (
    <div
      className="absolute left-5 top-5 px-4 py-2 rounded-full backdrop-blur-xl border"
      style={{
        background: "rgba(0,0,0,.45)",
        borderColor: `${category.color}55`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>

        <span
          className="font-bold text-sm"
          style={{
            color: category.color,
          }}
        >
          {category.label}
        </span>
      </div>
    </div>
  )}

  {/* Bottom Content */}

  <div className="absolute bottom-6 left-6 right-6">
    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="text-[34px] leading-none font-black text-white drop-shadow-lg"
    >
      {place.name}
    </motion.h1>

    <div className="mt-3 flex flex-wrap gap-2">

      <div className="px-3 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/10 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-white/70" />

        <span className="text-sm text-white/90 font-medium">
          {[place.city, place.district, place.state]
            .filter(Boolean)
            .join(", ")}
        </span>
      </div>

      {distance && (
        <div className="px-3 py-2 rounded-full bg-blue-500/20 border border-blue-400/20 backdrop-blur-xl flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-400" />

          <span className="text-sm font-bold text-blue-300">
            {distance} km away
          </span>
        </div>
      )}

    </div>
  </div>
</div>

            {/* content */}
            <div className="px-6 py-6 space-y-6">
              {/* ================= ABOUT ================= */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-white text-lg font-bold">
                    About this place
                  </h2>

                  {category && (
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: `${category.color}20`,
                        color: category.color,
                      }}
                    >
                      {category.label}
                    </div>
                  )}
                </div>

                <p className="mt-4 text-[15px] leading-7 text-white/70">
                  {description}
                </p>

                {place.description &&
                  place.description.length > DESCRIPTION_LIMIT && (
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="mt-4 flex items-center gap-2 text-blue-400 font-semibold text-sm"
                    >
                      {expanded ? (
                        <>
                          Show less
                          <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Read more
                          <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                  )}
              </motion.div>

              {/* ================= QUICK INFO ================= */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-2xl mb-2">📍</div>
                  <div className="text-white font-semibold">
                    {place.city || place.district}
                  </div>
                  <div className="text-white/45 text-sm mt-1">Karnataka</div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-2xl mb-2">{emoji}</div>
                  <div className="text-white font-semibold">
                    {category?.label || "Destination"}
                  </div>
                  <div className="text-white/45 text-sm mt-1">
                    Tourist Category
                  </div>
                </div>
              </div>

              {/* ================= ACTIONS ================= */}
              <div className="space-y-3">
                <button
                  onClick={() => onOpenInMaps(place)}
                  className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-5 flex items-center justify-between hover:scale-[1.02] transition active:scale-95"
                >
                  <div>
                    <div className="text-white font-bold text-lg">
                      Navigate
                    </div>
                    <div className="text-white/80 text-sm">
                      Open Google Maps directions
                    </div>
                  </div>
                  <ExternalLink className="text-white" size={28} />
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleShare}
                    className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 flex flex-col items-start gap-3 hover:bg-white/[0.08] transition"
                  >
                    <Share2 size={26} className="text-blue-400" />
                    <div>
                      <div className="text-white font-semibold">Share</div>
                      <div className="text-white/40 text-sm">
                        Send this place
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSaved(!saved)}
                    className={cn(
                      "rounded-3xl p-5 border transition",
                      saved
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-white/10 bg-white/[0.05]"
                    )}
                  >
                    <Bookmark
                      size={26}
                      className={cn(
                        saved ? "text-yellow-400 fill-yellow-400" : "text-white"
                      )}
                    />
                    <div className="mt-3 text-left">
                      <div className="text-white font-semibold">
                        {saved ? "Saved" : "Save"}
                      </div>
                      <div className="text-white/40 text-sm">
                        Add to favourites
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* ================= VIDEOS TITLE ================= */}
              <div className="flex items-center justify-between mt-8">
                <div>
                  <h2 className="text-xl font-bold text-white">Videos</h2>
                  <p className="text-white/40 text-sm mt-1">
                    Experiences from creators
                  </p>
                </div>

                {!loadingVideos && (
                  <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-white font-semibold">
                    {videos.length}
                  </div>
                )}
              </div>

              {/* ================= VIDEO SECTION ================= */}
              {loadingVideos ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-[250px] flex-shrink-0 animate-pulse">
                      <div className="h-[170px] rounded-3xl bg-white/10" />
                      <div className="mt-3 h-5 w-40 rounded bg-white/10" />
                      <div className="mt-2 h-4 w-28 rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              ) : videos.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center bg-white/[0.03]">
                  <div className="text-6xl mb-4">🎬</div>
                  <h3 className="text-white text-lg font-bold">
                    No Videos Yet
                  </h3>
                  <p className="text-white/45 mt-2">
                    Creators haven&apos;t uploaded videos for this place.
                  </p>
                </div>
              ) : (
                <div
                  className="flex gap-5 overflow-x-auto pb-5 snap-x snap-mandatory"
                  style={{ scrollbarWidth: "none" }}
                >
                  {videos.map((video) => {
                    const creator =
                      typeof video.creatorId === "object"
                        ? video.creatorId
                        : null;

                    return (
                      <motion.button
                        key={video._id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onWatchVideos(video)}
                        className="w-[255px] flex-shrink-0 text-left snap-start"
                      >
                        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#18181b] shadow-xl">
                          {/* thumbnail */}
                          <div className="relative h-[170px]">
                            {video.thumbnailUrl ? (
                              <Image
                                src={video.thumbnailUrl}
                                alt={video.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black" />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                            {/* play */}
                            <div className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl">
                              <Play size={24} className="fill-black text-black ml-1" />
                            </div>
                          </div>

                          {/* content */}
                          <div className="p-5">
                            <h3 className="font-bold text-white text-base line-clamp-2">
                              {video.title}
                            </h3>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center text-white font-bold">
                                  {creator?.profileImage ? (
                                    <Image
                                      src={creator.profileImage}
                                      alt={creator.fullName}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    creator?.fullName?.charAt(0) || "U"
                                  )}
                                </div>

                                <div>
                                  <div className="text-sm font-semibold text-white truncate max-w-[120px]">
                                    {creator?.fullName || "Creator"}
                                  </div>
                                  <div className="text-xs text-white/40">
                                    {video.views.toLocaleString()} views
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white">
                                Watch
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* ================= FOOTER ================= */}
              <div className="h-8" />

              <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-[#101114] via-[#101114] to-transparent pt-6 pb-[calc(env(safe-area-inset-bottom)+18px)]">
                <div className="flex justify-center">
                  <button
                    onClick={onClose}
                    className="px-8 py-3 rounded-full bg-white/10 border border-white/10 text-white font-semibold backdrop-blur-xl transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] active:scale-95"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}