
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Place, usePlaceStore } from "@/store/placeStore";


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
  keyword,
}: MapComponentProps) {
  const categoryRef = useRef(category);
  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  const keywordRef = useRef(keyword);
  useEffect(() => {
    keywordRef.current = keyword;
  }, [keyword]);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { fetchPlaces, places } = usePlaceStore();
  // const markersRef = useRef<any[]>([]);

  // const markersRef = useRef<{ marker: kakao.maps.Marker; overlay: kakao.maps.CustomOverlay }[]>([]);
  const markersRef = useRef<{ marker: kakao.maps.Marker; overlay?: kakao.maps.CustomOverlay }[]>([]);


  const injectKakaoMapScript = () => {
    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      // window.kakao.maps.load(() => setMapLoaded(true));
      window.kakao.maps.load(() => {
        setMapLoaded(true);
      });
    };
    document.head.appendChild(script);
  };

  useEffect(() => {
    if (document.getElementById("kakao-map-script")) {
      if (window.kakao) {
        // window.kakao.maps.load(() => setMapLoaded(true));
        window.kakao.maps.load(() => {
          setMapLoaded(true);
        });
      }
    } else {
      injectKakaoMapScript();
    }
  }, []);




  const loadPlacesByBounds = useCallback(async (bounds: kakao.maps.LatLngBounds) => {
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
      (currentKeyword && `&filters[name][$eq]=${currentKeyword}`);

    await fetchPlaces(query);
  }, [fetchPlaces, categorys]);

  // const loadPlacesByBounds = async () => {

  // };

  useEffect(() => {
    if (!mapLoaded || !window.kakao || !mapRef.current) return;

    const { kakao } = window;

    if (mapInstance.current) {
      const bounds = mapInstance.current.getBounds();
      loadPlacesByBounds(bounds);
      return;
    }

    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 3,
    });
    mapInstance.current = map;

    // ✅ marker가 있으면 초기 마커 표시 (selectable 여부 관계없이)
    if (marker) {
      const pos = new kakao.maps.LatLng(marker.lat, marker.lng);
      const initialMarker = new kakao.maps.Marker({ position: pos, map });
      markersRef.current.push({ marker: initialMarker });
      map.setCenter(pos);
    }

    // ✅ selectable일 때 클릭으로 마커 찍기
    if (selectable && onSelectLocation) {
      // kakao.maps.event.addListener(map, "click", (e: any) => {
      //   const latlng = e.latLng;
      //   onSelectLocation(latlng.getLat(), latlng.getLng());

      //   markersRef.current.forEach(({ marker }: any) => marker.setMap(null));
      //   markersRef.current = [];

      //   const marker = new kakao.maps.Marker({ position: latlng, map });
      //   markersRef.current.push({ marker });
      // });
      kakao.maps.event.addListener(map, "click", (e: { latLng: kakao.maps.LatLng }) => {
        const latlng = e.latLng;
        onSelectLocation(latlng.getLat(), latlng.getLng());
      
        markersRef.current.forEach(({ marker }) => marker.setMap(null));
        markersRef.current = [];
      
        const marker = new kakao.maps.Marker({ position: latlng, map });
        markersRef.current.push({ marker });
      });
      
    }

    // ✅ 일반 지도일 경우 idle에 따라 장소 불러오기
    if (!selectable && !marker) {
      kakao.maps.event.addListener(map, "idle", () => {
        const bounds = map.getBounds();
        loadPlacesByBounds(bounds);
      });

      const bounds = map.getBounds();
      loadPlacesByBounds(bounds);
    }
  }, [mapLoaded, category, keyword, loadPlacesByBounds, marker, onSelectLocation, selectable]);

  useEffect(() => {
    if (!mapInstance.current || !window.kakao || selectable || marker) return;
    const map = mapInstance.current;
    const { kakao } = window;

    // markersRef.current.forEach(({ marker }: any) => marker.setMap(null));
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
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

      const overlay = new kakao.maps.CustomOverlay({
        content,
        position,
        yAnchor: 1,
        map: null,
      });

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
  }, [places,onPlaceClick, marker, selectable]);

  return <div ref={mapRef} style={{ width: "100%", height }} />;
}
