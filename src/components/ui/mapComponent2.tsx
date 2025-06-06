"use client";
import { useEffect, useRef, useState } from "react";
import { Place, usePlaceStore } from "@/store/placeStore";

declare global {
  interface Window {
    kakao: any;
  }
}

interface MapComponentProps {
  category?: string;
  categorys?: string[];
  onPlaceClick?: (place: Place) => void;
  height?: string;

  selectable?: boolean;
  onSelectLocation?: (lat: number, lng: number) => void;

  marker?: { lat: number; lng: number };
  keyword?: string;
}

export default function MapComponent({
  category = "전체",
  categorys = [],
  onPlaceClick,
  height = "300px",
  selectable = false,
  onSelectLocation,
  marker,
  keyword
}: MapComponentProps) {
  // console.log('keyword', keyword)
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { fetchPlaces, places } = usePlaceStore();
  const markersRef = useRef<any[]>([]);

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

  const getCategoryFilterParams = (category: string): string => {
    if (!categorys.length || category === "전체") return "";
    if (category === "기타") {
      return categorys.map((cat, i) => `&filters[category][$notIn][${i}]=${cat}`).join("");
    }
    return `&filters[category][$eq]=${category}`;
  };

  const loadPlacesByBounds = async (bounds: kakao.maps.LatLngBounds) => {
    if (!category) return;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    console.log('keyword', keyword)
    const query =
      `/places?filters[latitude][$gte]=${sw.getLat()}&filters[latitude][$lte]=${ne.getLat()}` +
      `&filters[longitude][$gte]=${sw.getLng()}&filters[longitude][$lte]=${ne.getLng()}` +
      getCategoryFilterParams(category) +
      (keyword && `&filters[name][$eq]=${keyword}`);



    await fetchPlaces(query);
  };

  useEffect(() => {
    if (!mapLoaded || !window.kakao || !mapRef.current) return;

    const { kakao } = window;

    if (mapInstance.current) {
      // ✅ 지도는 이미 있으니까, 여기서 bounds로 API 호출만 하자
      const bounds = mapInstance.current.getBounds();
      loadPlacesByBounds(bounds);
      return;
    }

    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 3,
    });
    mapInstance.current = map;

    if (selectable && onSelectLocation) {
      kakao.maps.event.addListener(map, "click", (e: any) => {
        const latlng = e.latLng;
        onSelectLocation(latlng.getLat(), latlng.getLng());

        markersRef.current.forEach(({ marker }: any) => marker.setMap(null));
        markersRef.current = [];

        const marker = new kakao.maps.Marker({ position: latlng, map });
        markersRef.current.push({ marker });
      });
    } else if (marker) {
      const pos = new kakao.maps.LatLng(marker.lat, marker.lng);
      const singleMarker = new kakao.maps.Marker({ position: pos, map });
      markersRef.current.push({ marker: singleMarker });
      map.setCenter(pos);
    } else {
      kakao.maps.event.addListener(map, "idle", () => {
        const bounds = map.getBounds();
        loadPlacesByBounds(bounds);
      });

      const bounds = map.getBounds();
      loadPlacesByBounds(bounds);
    }
  }, [mapLoaded, category, keyword]);



  
  useEffect(() => {
    if (!mapInstance.current || !window.kakao || selectable || marker) return;
    const map = mapInstance.current;
    const { kakao } = window;

    markersRef.current.forEach(({ marker }: any) => marker.setMap(null));
    markersRef.current = [];

    places.forEach((place) => {
      const { latitude, longitude, name, category } = place.attributes;
      const position = new kakao.maps.LatLng(latitude, longitude);
      const marker = new kakao.maps.Marker({ position, map });

      const content = document.createElement("div");
      content.innerHTML = `
        <div class="custom-overlay-content inline-block bg-white rounded-md shadow-md px-[10px] py-[5px] text-[14px] whitespace-nowrap pointer-events-auto border border-gray-400 cursor-pointer">
          <strong class="text-purple-600 text-[16px]">${name}</strong><br />
          <span class="text-gray-500 text-[13px]">${category}</span>
        </div>`;

      const overlay = new kakao.maps.CustomOverlay({ content, position, yAnchor: 1, map: null });
      const show = () => overlay.setMap(map);
      const hide = () => setTimeout(() => overlay.setMap(null), 200);

      kakao.maps.event.addListener(marker, "mouseover", show);
      kakao.maps.event.addListener(marker, "mouseout", hide);
      content.addEventListener("mouseenter", show);
      content.addEventListener("mouseleave", hide);

      const div = content.querySelector(".custom-overlay-content");
      if (div && onPlaceClick) div.addEventListener("click", () => onPlaceClick(place));

      markersRef.current.push({ marker, overlay });
    });
  }, [places]);

  return <div ref={mapRef} style={{ width: "100%", height }} />;
}
