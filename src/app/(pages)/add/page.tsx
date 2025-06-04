"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { usePlaceStore } from '@/store/placeStore';
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { loadKakaoMap } from "@/utils/utils";
import MapComponent from "@/components/ui/mapComponent";


declare global {
  interface Window {
    kakao: any;
  }
}

export default function AddPlacePage() {
  // const mapRef = useRef<HTMLDivElement | null>(null);
  // const markerRef = useRef<any>(null);


  const [name, setName] = useState(""); // 맛집 이름
  const [category, setCategory] = useState(""); // 카테고리
  const [description, setDescription] = useState(""); // 설명
  const [mapLoaded, setMapLoaded] = useState(false);

  // 위치 좌표
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const { user } = useAuthStore();

  const { createPlace, isLoading } = usePlaceStore();

  useEffect(() => {
    loadKakaoMap(() => {
      setMapLoaded(true);
      console.log("kakao map loaded");
    });
  }, []);

  // const loadMap = () => {
  //   if (!window.kakao || !mapRef.current) return;

  //   const map = new window.kakao.maps.Map(mapRef.current, {
  //     center: new window.kakao.maps.LatLng(37.5665, 126.978),
  //     level: 3,
  //   });

  //   // 클릭 시 마커 및 좌표 표시
  //   window.kakao.maps.event.addListener(map, "click", function (mouseEvent: any) {
  //       const latlng = mouseEvent.latLng;

  //       // 이전 마커 제거
  //       if (markerRef.current) {
  //           markerRef.current.setMap(null);
  //       }

  //       // 새 마커 생성
  //       const marker = new window.kakao.maps.Marker({
  //           map: map,
  //           position: latlng,
  //       });

  //       markerRef.current = marker;
  //       setLat(latlng.getLat());
  //       setLng(latlng.getLng());

  //   });
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast.error("로그인 후 이용해주세요.");
        return;
    }
    if (lat === null || lng === null) {
        toast.error("지도를 클릭하여 위치를 선택해주세요.");
        return;
    }


    await createPlace({ name, category, description, latitude: lat, longitude: lng, users_permissions_user: user.id });
    // reset();
  };


//   const reset = () => {
//     setName("");
//     setCategory("");
//     setDescription("");
//     setLat(null);
//     setLng(null);
//     markerRef.current?.setMap(null);
//   }


  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <h1 className="text-2xl font-bold text-center text-purple-700 dark:text-purple-300 mb-6">맛집 등록</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="맛집 이름(필수)" required />
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="카테고리(필수)" required />
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명" />

            {/* 지도 */}
            {/* <div ref={mapRef} className="w-full h-[50vh] rounded-xl shadow border border-purple-200 dark:border-gray-700" /> */}
            <MapComponent
              mapLoaded={mapLoaded} 
              selectable
              onSelectLocation={(lat, lng) => {
                setLat(lat);
                setLng(lng);
              }}
              center={{ lat: 37.5665, lng: 126.9780 }}
            />



            {/* 위치 */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                위치: {lat && lng ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : "지도에서 위치를 클릭해주세요"}
            </div>

            {/* 등록 버튼 */}
            <Button
            type="submit"
            disabled={isLoading}
            className="bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isLoading ? "등록 중..." : "등록하기"}
            </Button>
            
        </form>





    </main>
  );
}
