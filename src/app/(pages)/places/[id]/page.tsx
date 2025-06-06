"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { usePlaceStore } from "@/store/placeStore";
import Review from "@/components/ui/review";
import MapComponent from "@/components/ui/mapComponent";

export default function PlaceDetailPage() {
    const { id } = useParams<{ id: string }>(); // 파라미터 가져오기 [예시] = http://localhost:3000/places/9 = id에 9가 들어감
    const { place, fetchPlace } = usePlaceStore(); // store 에서 가져오기

    useEffect(() => {
        fetchPlace(id);
    }, [id]);

    if (!place) return <div className="p-4">로딩 중...</div>;

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-purple-700">{place.attributes.name}</h1>
      <p className="text-gray-500 text-sm">종류 : {place.attributes.category}</p>

      {/* 설명 */}
      <p className="text-gray-700">소개 : {place.attributes.description || "소개글이 없습니다."}</p>

        {/* 지도 */}
        <MapComponent
        // category={category} 
        // categorys={["전체", "한식", "중식", "일식", "디저트", "카페", "기타"]} 
        height="400px"
        //   onPlaceClick={(place: Place) => {
        //     console.log('마커 클릭했음', place)
        //     router.push(`/places/${place.id}`);
        //   }}
        //   selectable={false} // 등록 모드
        //   onSelectLocation={(lat, lng) => console.log(lat, lng)} // 등록 모드에서 좌표 선택 시
        marker={{ lat: place.attributes.latitude, lng: place.attributes.longitude }} // 상세 모드
        />

        {/* 리뷰 댓글(해당 맛집에 대한 리뷰) */}
        <Review placeId={id} title="리뷰" />

    </main>
  );
}
