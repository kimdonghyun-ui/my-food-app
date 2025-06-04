"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { usePlaceStore } from "@/store/placeStore";
import { loadKakaoMap } from "@/utils/utils";
import Review from "@/components/ui/review";
import MapComponent from "@/components/ui/mapComponent";

export default function PlaceDetailPage() {
    const { id } = useParams<{ id: string }>(); // 파라미터 가져오기 [예시] = http://localhost:3000/places/9 = id에 9가 들어감
    const { fetchPlace, place } = usePlaceStore(); // store 에서 가져오기
    const [mapLoaded, setMapLoaded] = useState(false); // 지도 로드 상태 관리(처음은 false이다가 loadKakaoMap 실행 완료후 true로 변경됨)

  useEffect(() => {
    //loadKakaoMap = 카카오 맵 스크립트 head에 삽입 후 콜백 실행(setMapLoaded, fetchPlace)
    if (!id) return;
    loadKakaoMap(() => { // 카카오 스크립트 삽입 및 로드 완료
      setMapLoaded(true); // 지도 로드 상태를 true로 변경
      fetchPlace(id); // 해당 id의 맛집의 상세 데이터 가져오기
    });
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
            mapLoaded={mapLoaded}
            markers={[{ lat: place.attributes.latitude, lng: place.attributes.longitude }]}
            center={{ lat: place.attributes.latitude, lng: place.attributes.longitude }}
            zoom={4}
            height="250px"
        />

        {/* 리뷰 댓글(해당 맛집에 대한 리뷰) */}
        <Review placeId={id} title="리뷰" />

    </main>
  );
}
