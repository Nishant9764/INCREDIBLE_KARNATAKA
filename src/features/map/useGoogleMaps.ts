"use client";

import { useEffect, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

interface UseGoogleMapsOptions {
  apiKey: string;
}

interface UseGoogleMapsResult {
  isLoaded: boolean;
  loadError: Error | null;
}

let initialized = false;
let loadingPromise: Promise<void> | null = null;

export function useGoogleMaps({
  apiKey,
}: UseGoogleMapsOptions): UseGoogleMapsResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoadError(new Error("Missing Google Maps API key"));
      return;
    }

    if (!loadingPromise) {
      if (!initialized) {
        setOptions({
          key: apiKey,
          version: "weekly",
      });

        initialized = true;
      }

      loadingPromise = Promise.all([
        importLibrary("maps"),
        importLibrary("marker"),
      ]).then(() => {});
    }

    loadingPromise
      .then(() => setIsLoaded(true))
      .catch((err) => {
        console.error(err);
        setLoadError(err instanceof Error ? err : new Error("Failed to load Google Maps"));
      });
  }, [apiKey]);

  return {
    isLoaded,
    loadError,
  };
}