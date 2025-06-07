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
    }, [id, fetchPlace]);

    if (!place) return <div className="p-4">로딩 중...</div>;

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-purple-700">{place.attributes.name}</h1>
      <p className="text-gray-500 text-sm">종류 : {place.attributes.category}</p>

      {/* 설명 */}
      <p className="text-gray-700">소개 : {place.attributes.description || "소개글이 없습니다."}</p>

        {/* 지도 */}
            {/* 상세용 */}
            <MapComponent
        //   keyword={keyword} // 검색 키워드
          height="400px" // 놓이 
        //   category={category} // 카테고리
        //   categorys={categoryOptions}
        //   onPlaceClick={(place: Place) => {
        //     console.log('마커 클릭했음', place)
        //     router.push(`/places/${place.id}`);
        //   }}
          marker={{ lat: place.attributes.latitude, lng: place.attributes.longitude }}
          selectable={false}
        />

        {/* 리뷰 댓글(해당 맛집에 대한 리뷰) */}
        <Review placeId={id} title="리뷰" />

    </main>
  );
}
