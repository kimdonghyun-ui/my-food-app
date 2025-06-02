"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { usePlaceStore } from "@/store/placeStore";
import { loadKakaoMap } from "@/utils/utils";
import Review from "@/components/ui/review";

export default function PlaceDetailPage() {
    const { id } = useParams<{ id: string }>();
//   const [place, setPlace] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const { fetchPlace, place } = usePlaceStore();


  useEffect(() => {
    //useEffect 룰 활용해서 최초에만 실행되게 함
    //loadKakaoMap = 카카오 맵 스크립트 head에 삽입 후 콜백 실행(loadMap)
    if (!id) return;
    loadKakaoMap(() => fetchPlace(id));
  }, [id]);



  const loadMap = async () => {
    // 아직 스크립트 로드 중이거나 map DOM이 준비 안 됐으면 중단
    if (!place || !window.kakao || !mapRef.current) return;


    const { latitude, longitude } = place.attributes;
    const position = new window.kakao.maps.LatLng(latitude, longitude);

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: position,
      level: 3,
    });
    mapInstance.current = map;

    const marker = new window.kakao.maps.Marker({
      position,
      map,
    });

    // 중심에 강조 마커 하나
    marker.setMap(map);

  };




  useEffect(() => {
    loadMap();
  }, [place]);



  if (!place) return <div className="p-4">로딩 중...</div>;



  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-purple-700">{place.attributes.name}</h1>
      <p className="text-gray-500 text-sm">종류 : {place.attributes.category}</p>

      {/* 사진 슬라이더 */}
      {/* <div className="overflow-x-auto whitespace-nowrap space-x-2 flex">
        {photos?.data?.map((img: any) => (
          <img
            key={img.id}
            src={`${process.env.NEXT_PUBLIC_API_URL}${img.attributes.url}`}
            alt={name}
            className="w-48 h-32 object-cover rounded-lg shadow-md"
          />
        ))}
      </div> */}

      {/* 설명 */}
      <p className="text-gray-700">소개 : {place.attributes.description || "소개글이 없습니다."}</p>

      {/* 지도 */}
      <div ref={mapRef} className="w-full h-64 rounded-xl shadow-md border" />

      {/* 리뷰 영역 (예시용) */}
      {/* <section className="pt-4">
        <h2 className="text-lg font-semibold mb-2">리뷰</h2>
        <p className="text-sm text-gray-500">아직 등록된 리뷰가 없습니다.</p>
      </section> */}
      <Review placeId={id} />
    </main>
  );
}
