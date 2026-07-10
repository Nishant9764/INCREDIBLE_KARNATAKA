"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Plus, Loader2, Check } from "lucide-react";
import type { IPlace } from "@/types";

interface Props {
  selectedPlace: IPlace | null;
  onSelect: (place: IPlace) => void;
  onCreateNew: () => void;
}

export default function PlaceSearch({
  selectedPlace,
  onSelect,
  onCreateNew,
}: Props) {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (query.trim().length < 2) {
        setPlaces([]);
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(
          `/api/places/search?q=${encodeURIComponent(query)}`
        );

        const json = await res.json();

        setPlaces(json.data?.places ?? []);
        setShowResults(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />

        <input
          value={query}
          onFocus={() => setShowResults(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search place..."
          className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 pl-12 pr-12 text-white outline-none transition focus:border-orange-500"
        />

        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-orange-500" />
        )}
      </div>

      {selectedPlace && (
        <div className="mt-3 rounded-xl border border-green-600/40 bg-green-600/10 p-3">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />

            <div className="flex-1">
              <p className="text-white font-semibold">{selectedPlace.name}</p>

              <p className="text-xs text-zinc-400">
                {[
                  selectedPlace.city,
                  selectedPlace.district,
                  selectedPlace.state,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {showResults && (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          {places.length === 0 && !loading && query.length >= 2 && (
            <div className="px-6 py-8 text-center">
              <MapPin className="mx-auto mb-3 w-8 h-8 text-zinc-500" />

              <p className="text-white font-medium">No places found</p>

              <p className="text-sm text-zinc-500 mt-1">
                Create a new place below.
              </p>
            </div>
          )}

          {places.map((place) => (
            <button
              key={place._id}
              type="button"
              onClick={() => {
                onSelect(place);
                setQuery(place.name);
                setShowResults(false);
              }}
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-zinc-900 transition border-b border-zinc-800 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-400" />
              </div>

              <div className="flex-1">
                <p className="text-white font-semibold">{place.name}</p>

                <p className="text-xs text-zinc-400">
                  {[place.city, place.district, place.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={onCreateNew}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-orange-500/10 transition"
          >
            <Plus className="w-5 h-5 text-orange-400" />

            <span className="font-semibold text-orange-400">
              Create New Place
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
