"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocateFixed, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Place } from "@/store/placeStore";
// import { toast } from "react-hot-toast";
import MapComponent, { MapComponentRef } from "@/components/ui/mapComponent";


export default function HomePage() {
  const mapRef = useRef<MapComponentRef>(null);

  const router = useRouter();

  const [category, setCategory] = useState<string>("전체");
  const [keyword, setKeyword] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  // const mapInstance = useRef<kakao.maps.Map | null>(null);

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);
  };

  const handleSearch = () => {
    setKeyword(inputValue);
    setCategory('전체');
  };
  
  const categoryOptions = useMemo(
    () => ["전체", "한식", "중식", "일식", "디저트", "카페", "기타"],
    []
  );

  // const handleGoToCurrentLocation = () => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         mapInstance.current?.setCenter(new kakao.maps.LatLng(latitude, longitude));
  //       },
  //       (error) => {
  //         switch (error.code) {
  //           case error.PERMISSION_DENIED:
  //             toast.error("위치 권한을 허용해야 현재 위치로 이동할 수 있어요.");
  //             break;
  //           case error.POSITION_UNAVAILABLE:
  //             toast.error("위치 정보를 사용할 수 없어요.");
  //             break;
  //           case error.TIMEOUT:
  //             toast.error("위치 정보를 가져오는 데 시간이 너무 오래 걸려요.");
  //             break;
  //           default:
  //             toast.error("현재 위치를 가져올 수 없어요.");
  //             break;
  //         }
  //       }
  //     );
  //   } else {
  //     toast.error("브라우저가 위치 정보를 지원하지 않아요.");
  //   }
  // };
  
useEffect(() => {
  console.log('categorycategorycategorycategory',category)
}, [category]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-950 dark:to-gray-800 transition-colors duration-300">
      <section className="flex flex-col h-[calc(100vh-64px)] px-4 pt-6 pb-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center text-purple-800 dark:text-purple-300 mb-3">
          주변 맛집 찾기 ({category})
        </h1>

        <div className="flex gap-2">
          <Input
            onClear={() => {
              setKeyword("");
              setInputValue("");
            }}
            showClearButton 
            placeholder="맛집 이름, 카테고리 검색" 
            className="flex-1 text-base py-2" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }} 
          />
          {/* 🔍 검색 버튼 */}
          <Button
            variant="outline"
            size="icon"
            className="bg-white dark:bg-gray-800"
            onClick={handleSearch}
          >
            <Search className="w-5 h-5 text-purple-600 dark:text-purple-300" />
          </Button>

          {/* 📍 현재 위치 버튼 */}
          <Button
            variant="outline"
            size="icon"
            className="bg-white dark:bg-gray-800"
            onClick={() => mapRef.current?.goToCurrentLocation()}
          >
            <LocateFixed className="w-5 h-5 text-purple-600 dark:text-purple-300" />
          </Button>
        </div>

        {/* 카테고리 버튼 영역 */}
        <div className="overflow-auto whitespace-nowrap space-x-2 scrollbar-hide my-3">
          {["전체", "한식", "중식", "일식", "디저트", "카페", "기타"].map((cat: string) => (
            <Button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`rounded-full px-4 py-1 text-sm border-purple-300 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800 ${
                category === cat ? "bg-purple-300 dark:bg-purple-700 text-white" : ""
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
        {/* 카테고리 버튼 영역 */}

        {/* 지도 영역 */}
        {/* 메인용 */}
        <div className="flex-1 overflow-hidden">
          <MapComponent
            keyword={keyword} // 검색 키워드
            height="100%" // 놓이 
            category={category} // 카테고리
            categorys={categoryOptions}
            onPlaceClick={(place: Place) => {
              console.log('마커 클릭했음', place)
              router.push(`/places/${place.id}`);
            }}
          //   marker={{ lat: 37.5665, lng: 126.978 }}
            selectable={false}
            ref={mapRef}
          />
        </div>
        {/* 지도 영역 */}

        {/* 맛집 추가 페이지로 이동 */}
        <div className="">
          <Button
            onClick={() => router.push("/add")}
            className="mt-4 w-full h-12 bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-400"
          >
            맛집 등록하기
          </Button>
        </div>
        {/* 맛집 추가 버튼 */}


      </section>
    </main>
  );
}
