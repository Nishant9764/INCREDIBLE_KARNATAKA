"use client";

import { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  MapPin,
  Building2,
  Globe,
  AlignLeft,
  Tag,
  Save,
} from "lucide-react";

interface NewPlace {
  name: string;
  address: string;
  city: string;
  district: string;
  state: string;
  category: string;
  description: string;
  lat: string;
  lng: string;
}

interface Props {
  open: boolean;
  place: NewPlace;
  setPlace: Dispatch<SetStateAction<NewPlace>>;
  onClose: () => void;
  onSave: () => void;
}

const categories = [
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
];

export default function PlaceCreateModal({
  open,
  place,
  setPlace,
  onClose,
  onSave,
}: Props) {
  const update = (field: keyof NewPlace, value: string) => {
    setPlace((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 28,
            }}
            className="
              fixed
              bottom-0
              left-0
              right-0
              z-50
              bg-[#111114]
              rounded-t-[34px]
              border-t
              border-zinc-800
              max-h-[92vh]
              overflow-y-auto
            "
          >
            <div className="sticky top-0 bg-[#111114] z-10">
              <div className="w-14 h-1.5 rounded-full bg-zinc-700 mx-auto mt-3" />

              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Create New Place
                  </h2>

                  <p className="text-sm text-zinc-400 mt-1">
                    This place will be linked with the uploaded video.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-zinc-900
                    flex
                    items-center
                    justify-center
                  "
                >
                  <X className="w-5 h-5 text-zinc-300" />
                </button>
              </div>
            </div>

            <div className="px-6 pb-8 space-y-6">
              {/* Place Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Place Name
                </label>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />

                  <input
                    value={place.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Ex: MTR Restaurant"
                    className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 pl-12 pr-4 text-white outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Address
                </label>

                <div className="relative">
                  <Building2 className="absolute left-4 top-5 w-5 h-5 text-orange-400" />

                  <textarea
                    rows={3}
                    value={place.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="Street, Area, Landmark..."
                    className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 pl-12 pr-4 py-4 text-white resize-none outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* City & District */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    City
                  </label>

                  <input
                    value={place.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 px-4 text-white outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    District
                  </label>

                  <input
                    value={place.district}
                    onChange={(e) => update("district", e.target.value)}
                    placeholder="Bengaluru Urban"
                    className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 px-4 text-white outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  State
                </label>

                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />

                  <input
                    value={place.state}
                    onChange={(e) => update("state", e.target.value)}
                    className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 pl-12 pr-4 text-white outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Category
                </label>

                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />

                  <select
                    value={place.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 pl-12 pr-4 text-white outline-none focus:border-orange-500"
                  >
                    <option value="">Select Category</option>

                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Latitude
                  </label>

                  <input
                    value={place.lat}
                    onChange={(e) => update("lat", e.target.value)}
                    placeholder="12.9716"
                    className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 px-4 text-white outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Longitude
                  </label>

                  <input
                    value={place.lng}
                    onChange={(e) => update("lng", e.target.value)}
                    placeholder="77.5946"
                    className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 px-4 text-white outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>

                <div className="relative">
                  <AlignLeft className="absolute left-4 top-5 w-5 h-5 text-orange-400" />

                  <textarea
                    rows={4}
                    value={place.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Describe this place..."
                    className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 pl-12 pr-4 py-4 text-white resize-none outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-[#111114] border-t border-zinc-800 pt-5 pb-8 mt-8">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="
        flex-1
        h-14
        rounded-2xl
        border
        border-zinc-700
        text-zinc-300
        font-semibold
        hover:bg-zinc-900
        transition
      "
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={onSave}
                    disabled={
                      !place.name ||
                      !place.city ||
                      !place.category ||
                      !place.lat ||
                      !place.lng
                    }
                    className="
        flex-1
        h-14
        rounded-2xl
        bg-gradient-to-r
        from-orange-500
        to-amber-500
        text-white
        font-bold
        flex
        items-center
        justify-center
        gap-3
        shadow-lg
        shadow-orange-500/20
        disabled:opacity-40
        disabled:cursor-not-allowed
        hover:scale-[1.02]
        active:scale-[0.98]
        transition-all
      "
                  >
                    <Save className="w-5 h-5" />
                    Save Place
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
