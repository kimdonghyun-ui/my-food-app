"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePlaceStore } from '@/store/placeStore';
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import MapComponent from "@/components/ui/mapComponent";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function AddPlacePage() {
  const [name, setName] = useState(""); // 맛집 이름
  const [category, setCategory] = useState(""); // 카테고리
  const [description, setDescription] = useState(""); // 설명

  // 위치 좌표
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const { user } = useAuthStore();

  const { createPlace, isLoading } = usePlaceStore();

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
  };


  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <h1 className="text-2xl font-bold text-center text-purple-700 dark:text-purple-300 mb-6">맛집 등록</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="맛집 이름(필수)" required />
        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="카테고리(필수)" required />
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명" />

        {/* 지도 */}
        <MapComponent
          // category={category} 
          // categorys={["전체", "한식", "중식", "일식", "디저트", "카페", "기타"]} 
          height="400px"
          // onPlaceClick={(place: Place) => {
          //   console.log('마커 클릭했음', place)
          //   router.push(`/places/${place.id}`);
          // }}
          selectable={true} // 등록 모드
          onSelectLocation={(lat, lng) => {
            console.log('lat, lng', lat, lng)
            setLat(lat);
            setLng(lng);
          }} // 등록 모드에서 좌표 선택 시
          marker={{ lat: 37.5, lng: 126.9 }} // 상세 모드
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
