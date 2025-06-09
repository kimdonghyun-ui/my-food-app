// "use client";
// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { Place, usePlaceStore } from "@/store/placeStore";
// import LoadingOverlay from "@/components/LoadingOverlay";

// interface MapComponentProps {
//   keyword?: string;
//   height?: string;
//   category?: string;
//   categorys?: string[];
//   onPlaceClick?: (place: Place) => void;
//   selectable?: boolean;
//   onSelectLocation?: (lat: number, lng: number) => void;
//   marker?: { lat: number; lng: number };
// }

// export default function MapComponent({
//   keyword = "",
//   height = "300px",
//   category = "전체",
//   categorys,
//   onPlaceClick,
//   selectable = false,
//   onSelectLocation,
//   marker,
// }: MapComponentProps) {
//   const [mapLoaded, setMapLoaded] = useState(false);
//   const { fetchPlaces, places, isLoading } = usePlaceStore();
//   const mapRef = useRef<HTMLDivElement>(null);
//   const mapInstance = useRef<kakao.maps.Map | null>(null);
//   const markersRef = useRef<{ marker: kakao.maps.Marker; overlay?: kakao.maps.CustomOverlay }[]>([]);
//   const clickMarkerRef = useRef<kakao.maps.Marker | null>(null);
//   const clickListenerRef = useRef<((mouseEvent: kakao.maps.event.MouseEvent) => void) | null>(null);

//   const stableCategorys = useMemo(() => Array.isArray(categorys) ? categorys : [], [categorys]);

//   const categoryRef = useRef(category);
//   const keywordRef = useRef(keyword);

//   useEffect(() => {
//     categoryRef.current = category;
//   }, [category]);

//   useEffect(() => {
//     keywordRef.current = keyword;
//   }, [keyword]);

//   const injectKakaoMapScript = () => {
//     const script = document.createElement("script");
//     script.id = "kakao-map-script";
//     script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
//     script.async = true;
//     script.onload = () => {
//       window.kakao.maps.load(() => setMapLoaded(true));
//     };
//     document.head.appendChild(script);
//   };

//   useEffect(() => {
//     if (document.getElementById("kakao-map-script")) {
//       if (window.kakao) {
//         window.kakao.maps.load(() => setMapLoaded(true));
//       }
//     } else {
//       injectKakaoMapScript();
//     }
//   }, []);

//   const loadPlacesByBounds = useCallback(
//     async (bounds: kakao.maps.LatLngBounds) => {
//       const currentCategory = categoryRef.current;
//       const currentKeyword = keywordRef.current;

//       if (!currentCategory) return;

//       const sw = bounds.getSouthWest();
//       const ne = bounds.getNorthEast();

//       const getCategoryFilterParams = (category: string): string => {
//         if (!Array.isArray(stableCategorys) || !stableCategorys.length || category === "전체") return "";
//         if (category === "기타") {
//           return stableCategorys
//             .map((cat, i) => `&filters[category][$notIn][${i}]=${cat}`)
//             .join("");
//         }
//         return `&filters[category][$eq]=${category}`;
//       };

//       const query =
//         `/places?filters[latitude][$gte]=${sw.getLat()}&filters[latitude][$lte]=${ne.getLat()}` +
//         `&filters[longitude][$gte]=${sw.getLng()}&filters[longitude][$lte]=${ne.getLng()}` +
//         getCategoryFilterParams(currentCategory) +
//         (currentKeyword ? `&filters[name][$eq]=${currentKeyword}` : "");

//       await fetchPlaces(query);
//     },
//     [stableCategorys, fetchPlaces]
//   );

//   useEffect(() => {
//     if (!mapInstance.current || marker || selectable) return;
//     const bounds = mapInstance.current.getBounds();
//     loadPlacesByBounds(bounds);
//   }, [category, keyword, marker, selectable, loadPlacesByBounds]);

//   useEffect(() => {
//     if (!mapLoaded || !window.kakao || !mapRef.current) return;

//     const { kakao } = window;
//     let map = mapInstance.current;

//     if (!map) {
//       map = new kakao.maps.Map(mapRef.current, {
//         center: new kakao.maps.LatLng(37.5665, 126.978),
//         level: 3,
//       });
//       mapInstance.current = map;
//     }

//     if (selectable) {
//       if (marker) {
//         const pos = new kakao.maps.LatLng(marker.lat, marker.lng);

//         if (!clickMarkerRef.current) {
//           const m = new kakao.maps.Marker({ position: pos, map });
//           m.setMap(map);
//           clickMarkerRef.current = m;
//         } else {
//           clickMarkerRef.current.setMap(map);
//           clickMarkerRef.current.setPosition(pos);
//         }
//       }

//       if (clickListenerRef.current) {
//         kakao.maps.event.removeListener(map, "click", clickListenerRef.current);
//       }

//       const clickHandler = (mouseEvent: kakao.maps.event.MouseEvent) => {
//         const latlng = mouseEvent.latLng;

//         if (!clickMarkerRef.current) {
//           const m = new kakao.maps.Marker({ position: latlng, map });
//           m.setMap(map);
//           clickMarkerRef.current = m;
//         } else {
//           clickMarkerRef.current.setPosition(latlng);
//         }

//         onSelectLocation?.(latlng.getLat(), latlng.getLng());
//       };

//       kakao.maps.event.addListener(map, "click", clickHandler);
//       clickListenerRef.current = clickHandler;
//       return;
//     }

//     if (marker && !selectable) {
//       markersRef.current.forEach(({ marker }) => marker.setMap(null));
//       markersRef.current = [];

//       const pos = new kakao.maps.LatLng(marker.lat, marker.lng);
//       const m = new kakao.maps.Marker({ position: pos, map });
//       m.setMap(map);
//       map.setCenter(pos);
//       markersRef.current = [{ marker: m }];
//       return;
//     }

//     const bounds = map.getBounds();
//     loadPlacesByBounds(bounds);

//     const idleHandler = () => {
//       const bounds = map!.getBounds();
//       loadPlacesByBounds(bounds);
//     };

//     kakao.maps.event.addListener(map, "idle", idleHandler);

//     return () => {
//       kakao.maps.event.removeListener(map, "idle", idleHandler);
//     };
//   }, [mapLoaded, loadPlacesByBounds, marker, selectable, onSelectLocation]);

//   useEffect(() => {
//     if (!mapInstance.current || !window.kakao || selectable || marker) return;
//     const map = mapInstance.current;
//     const { kakao } = window;

//     markersRef.current.forEach(({ marker }) => marker.setMap(null));
//     markersRef.current = [];

//     places.forEach((place) => {
//       const { latitude, longitude, name, category } = place.attributes;
//       const position = new kakao.maps.LatLng(latitude, longitude);
//       const marker = new kakao.maps.Marker({ position, map });

//       const content = document.createElement("div");
//       content.innerHTML = `
//         <div class="custom-overlay-content inline-block bg-white rounded-md shadow-md px-[10px] py-[5px] text-[14px] whitespace-nowrap pointer-events-auto border border-gray-400 cursor-pointer">
//           <strong class="text-purple-600 text-[16px]">${name}</strong><br />
//           <span class="text-gray-500 text-[13px]">${category}</span>
//         </div>`;

//       const overlay = new kakao.maps.CustomOverlay({
//         content,
//         position,
//         yAnchor: 1,
//         map: null,
//       });

//       const show = () => overlay.setMap(map);
//       const hide = () => setTimeout(() => overlay.setMap(null), 200);

//       kakao.maps.event.addListener(marker, "mouseover", show);
//       kakao.maps.event.addListener(marker, "mouseout", hide);
//       kakao.maps.event.addListener(marker, "click", () => {
//         overlay.setMap(map);
//         setTimeout(() => overlay.setMap(null), 2000);
//       });

//       content.addEventListener("mouseenter", show);
//       content.addEventListener("mouseleave", hide);
//       content.addEventListener("touchstart", show);

//       const div = content.querySelector(".custom-overlay-content");
//       if (div && onPlaceClick) div.addEventListener("click", () => onPlaceClick(place));

//       markersRef.current.push({ marker, overlay });
//     });
//   }, [places, onPlaceClick, marker, selectable]);

//   return (
//     <div className="relative" style={{ width: "100%", height }}>
//       <LoadingOverlay show={isLoading} />
//       <div ref={mapRef} style={{ width: "100%", height }} />
//     </div>
    
//   );
// }




"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Place, usePlaceStore } from "@/store/placeStore";
import LoadingOverlay from "@/components/LoadingOverlay";
import { toast } from "react-hot-toast";

// ✅ 부모에서 사용할 수 있는 메서드 정의
export interface MapComponentRef {
  goToCurrentLocation: () => void;
}

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

// ✅ forwardRef로 감싸서 ref 사용 가능하게 함
const MapComponent = forwardRef<MapComponentRef, MapComponentProps>(({
  keyword = "",
  height = "300px",
  category = "전체",
  categorys,
  onPlaceClick,
  selectable = false,
  onSelectLocation,
  marker,
}, ref) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const { fetchPlaces, places, isLoading } = usePlaceStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<{ marker: kakao.maps.Marker; overlay?: kakao.maps.CustomOverlay }[]>([]);
  const clickMarkerRef = useRef<kakao.maps.Marker | null>(null);
  const clickListenerRef = useRef<((mouseEvent: kakao.maps.event.MouseEvent) => void) | null>(null);

  const stableCategorys = useMemo(() => Array.isArray(categorys) ? categorys : [], [categorys]);
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
        if (!Array.isArray(stableCategorys) || !stableCategorys.length || category === "전체") return "";
        if (category === "기타") {
          return stableCategorys
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
    [stableCategorys, fetchPlaces]
  );

  useEffect(() => {
    if (!mapInstance.current || marker || selectable) return;
    const bounds = mapInstance.current.getBounds();
    loadPlacesByBounds(bounds);
  }, [category, keyword, marker, selectable, loadPlacesByBounds]);

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
          const m = new kakao.maps.Marker({ position: pos, map });
          m.setMap(map);
          clickMarkerRef.current = m;
        } else {
          clickMarkerRef.current.setMap(map);
          clickMarkerRef.current.setPosition(pos);
        }

        // ✅ 지도 중심을 마커 위치로 이동
        map.setCenter(pos);

      }

      if (clickListenerRef.current) {
        kakao.maps.event.removeListener(map, "click", clickListenerRef.current);
      }

      const clickHandler = (mouseEvent: kakao.maps.event.MouseEvent) => {
        const latlng = mouseEvent.latLng;

        if (!clickMarkerRef.current) {
          const m = new kakao.maps.Marker({ position: latlng, map });
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
      markersRef.current.forEach(({ marker }) => marker.setMap(null));
      markersRef.current = [];

      const pos = new kakao.maps.LatLng(marker.lat, marker.lng);
      const m = new kakao.maps.Marker({ position: pos, map });
      m.setMap(map);
      map.setCenter(pos);
      markersRef.current = [{ marker: m }];
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
    if (!mapInstance.current || !window.kakao || selectable || marker) return;
    const map = mapInstance.current;
    const { kakao } = window;

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
      kakao.maps.event.addListener(marker, "click", () => {
        overlay.setMap(map);
        setTimeout(() => overlay.setMap(null), 2000);
      });

      content.addEventListener("mouseenter", show);
      content.addEventListener("mouseleave", hide);
      content.addEventListener("touchstart", show);

      const div = content.querySelector(".custom-overlay-content");
      if (div && onPlaceClick) div.addEventListener("click", () => onPlaceClick(place));

      markersRef.current.push({ marker, overlay });
    });
  }, [places, onPlaceClick, marker, selectable]);

  // ✅ 외부에서 호출할 수 있는 메서드 노출
  const handleGoToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const latlng = new kakao.maps.LatLng(coords.latitude, coords.longitude);
          mapInstance.current?.setCenter(latlng);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              toast.error("위치 권한을 허용해야 현재 위치로 이동할 수 있어요.");
              break;
            case error.POSITION_UNAVAILABLE:
              toast.error("위치 정보를 사용할 수 없어요.");
              break;
            case error.TIMEOUT:
              toast.error("위치 정보를 가져오는 데 시간이 너무 오래 걸려요.");
              break;
            default:
              toast.error("현재 위치를 가져올 수 없어요.");
              break;
          }
        }
      );
    } else {
      toast.error("브라우저가 위치 정보를 지원하지 않아요.");
    }
  };

  useImperativeHandle(ref, () => ({
    goToCurrentLocation: handleGoToCurrentLocation,
  }));

  MapComponent.displayName = "MapComponent";

  return (
    <div className="relative" style={{ width: "100%", height }}>
      <LoadingOverlay show={isLoading} />
      <div ref={mapRef} style={{ width: "100%", height }} />
    </div>
  );
});

export default MapComponent;
