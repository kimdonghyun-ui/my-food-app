"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Place, usePlaceStore } from "@/store/placeStore";

interface MapComponentProps {
  keyword?: string;
  height?: string;
  category?: string;
  categorys?: string[];
  onPlaceClick?: (place: Place) => void;
  selectable?: boolean;
  onSelectLocation?: (lat: number, lng: number) => void;
  marker?: { lat: number; lng: number };
}

export default function MapComponent({
  keyword = "",
  height = "300px",
  category = "전체",
  categorys = [],
  onPlaceClick,
  selectable = false,
  onSelectLocation,
  marker,
}: MapComponentProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const { fetchPlaces, places } = usePlaceStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const clickMarkerRef = useRef<kakao.maps.Marker | null>(null);
  const clickListenerRef = useRef<kakao.maps.MapEventListener | null>(null);

  const categoryRef = useRef(category);
  const keywordRef = useRef(keyword);

  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  useEffect(() => {
    keywordRef.current = keyword;
  }, [keyword]);

  const injectKakaoMapScript = () => {
    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => setMapLoaded(true));
    };
    document.head.appendChild(script);
  };

  useEffect(() => {
    if (document.getElementById("kakao-map-script")) {
      if (window.kakao) {
        window.kakao.maps.load(() => setMapLoaded(true));
      }
    } else {
      injectKakaoMapScript();
    }
  }, []);

  const loadPlacesByBounds = useCallback(
    async (bounds: kakao.maps.LatLngBounds) => {
      const currentCategory = categoryRef.current;
      const currentKeyword = keywordRef.current;

      if (!currentCategory) return;

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const getCategoryFilterParams = (category: string): string => {
        if (!categorys.length || category === "전체") return "";
        if (category === "기타") {
          return categorys
            .map((cat, i) => `&filters[category][$notIn][${i}]=${cat}`)
            .join("");
        }
        return `&filters[category][$eq]=${category}`;
      };

      const query =
        `/places?filters[latitude][$gte]=${sw.getLat()}&filters[latitude][$lte]=${ne.getLat()}` +
        `&filters[longitude][$gte]=${sw.getLng()}&filters[longitude][$lte]=${ne.getLng()}` +
        getCategoryFilterParams(currentCategory) +
        (currentKeyword ? `&filters[name][$eq]=${currentKeyword}` : "");

      await fetchPlaces(query);
    },
    [categorys, fetchPlaces]
  );

  useEffect(() => {
    if (!mapLoaded || !window.kakao || !mapRef.current) return;

    const { kakao } = window;
    let map = mapInstance.current;

    if (!map) {
      map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(37.5665, 126.978),
        level: 3,
      });
      mapInstance.current = map;
    }

    if (selectable) {
      if (marker) {
        const pos = new kakao.maps.LatLng(marker.lat, marker.lng);

        if (!clickMarkerRef.current) {
          const m = new kakao.maps.Marker({ position: pos });
          m.setMap(map);
          clickMarkerRef.current = m;
        } else {
          clickMarkerRef.current.setMap(map);
          clickMarkerRef.current.setPosition(pos);
        }
      }

      if (clickListenerRef.current) {
        kakao.maps.event.removeListener(map, "click", clickListenerRef.current);
      }

      const clickHandler = (mouseEvent: kakao.maps.event.MouseEvent) => {
        const latlng = mouseEvent.latLng;

        if (!clickMarkerRef.current) {
          const m = new kakao.maps.Marker({ position: latlng });
          m.setMap(map);
          clickMarkerRef.current = m;
        } else {
          clickMarkerRef.current.setPosition(latlng);
        }

        onSelectLocation?.(latlng.getLat(), latlng.getLng());
      };

      kakao.maps.event.addListener(map, "click", clickHandler);
      clickListenerRef.current = clickHandler;
      return;
    }

    if (marker && !selectable) {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const pos = new kakao.maps.LatLng(marker.lat, marker.lng);
      const m = new kakao.maps.Marker({ position: pos });
      m.setMap(map);
      map.setCenter(pos);
      markersRef.current = [m];
      return;
    }

    const bounds = map.getBounds();
    loadPlacesByBounds(bounds);

    const idleHandler = () => {
      const bounds = map!.getBounds();
      loadPlacesByBounds(bounds);
    };

    kakao.maps.event.addListener(map, "idle", idleHandler);

    return () => {
      kakao.maps.event.removeListener(map, "idle", idleHandler);
    };
  }, [mapLoaded, loadPlacesByBounds, marker, selectable, onSelectLocation]);

  useEffect(() => {
    if (marker || !mapInstance.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (places.length === 0) return;

    const { kakao } = window;
    const newMarkers = places.map((place) => {
      const pos = new kakao.maps.LatLng(
        place.attributes.latitude,
        place.attributes.longitude
      );
      const m = new kakao.maps.Marker({ position: pos, map: mapInstance.current! });

      if (onPlaceClick) {
        kakao.maps.event.addListener(m, "click", () => onPlaceClick(place));
      }

      return m;
    });

    markersRef.current = newMarkers;
  }, [places, onPlaceClick, marker]);

  useEffect(() => {
    if (!mapInstance.current || marker) return;
    const bounds = mapInstance.current.getBounds();
    loadPlacesByBounds(bounds);
  }, [category, keyword]);

  return <div ref={mapRef} style={{ width: "100%", height }} />;
}
