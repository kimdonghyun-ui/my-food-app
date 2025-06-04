"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

interface MapComponentProps {
    markers?: { lat: number; lng: number; label?: string }[];
    selectable?: boolean;
    onSelectLocation?: (lat: number, lng: number) => void;
    center?: { lat: number; lng: number };
    zoom?: number;
    height?: string;
    mapLoaded?: boolean; // ✅ 외부 트리거
}

export default function MapComponent({
  markers = [],
  selectable = false,
  onSelectLocation,
  center = { lat: 37.5665, lng: 126.978 },
  zoom = 3,
  height = "400px",
  mapLoaded,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // 지도 초기화 (최초 한 번만)
  useEffect(() => {
    if (!mapLoaded) return; // ✅ mapLoaded가 false면 초기화 X
    console.log("지도 초기화!");
    if (!window.kakao || !mapRef.current) return;
    console.log("아리랑");
    const { kakao } = window;

    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level: zoom,
    });
    mapInstance.current = map;

    // 클릭 마커 설정
    if (selectable && onSelectLocation) {
      const clickListener = (mouseEvent: any) => {
        const latlng = mouseEvent.latLng;

        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        const marker = new kakao.maps.Marker({
          position: latlng,
          map,
        });
        markerRef.current = marker;

        onSelectLocation(latlng.getLat(), latlng.getLng());
      };

      kakao.maps.event.addListener(map, "click", clickListener);
    }
  }, [mapLoaded]);

  // 마커들만 업데이트 (center는 건드리지 않음)
  useEffect(() => {
    // if (!window.kakao || !mapInstance.current) return;
    const { kakao } = window;
    const map = mapInstance.current;

    if (!selectable) {
      // 여러 개 마커 표시용
      markers.forEach(({ lat, lng }) => {
        new kakao.maps.Marker({
          position: new kakao.maps.LatLng(lat, lng),
          map,
        });
      });
    }
  }, [markers]);

  return <div ref={mapRef} style={{ width: "100%", height }} />;
}
