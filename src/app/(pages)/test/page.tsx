"use client";

import { Button } from "@/components/ui/button";
import MapComponent from "@/components/ui/mapComponent2";
import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Place } from "@/store/placeStore";
import { useRouter } from "next/navigation";

export default function TesetPage() {
  const router = useRouter();
  const [category, setCategory] = useState("전체");
  const [inputValue, setInputValue] = useState("");
  const [keyword, setKeyword] = useState("");
  
  const handleCategoryClick = (cat: string) => {
    setCategory(cat);
  };






  const handleSearch = () => {
    console.log('검색버튼 클릭했음');
    setKeyword(inputValue);
    setCategory('전체');
  };








  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-950 dark:to-gray-800 transition-colors duration-300">
      <section className="flex flex-col gap-4 px-4 pt-6 pb-32 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center text-purple-800 dark:text-purple-300">
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
          }} />
          {/* 🔍 검색 버튼 */}
          <Button
            variant="outline"
            size="icon"
            className="bg-white dark:bg-gray-800"
            onClick={handleSearch}
          >
            <Search className="w-5 h-5 text-purple-600 dark:text-purple-300" />
          </Button>
        </div>
          
          
          
          
          
              {/* 카테고리 버튼 영역 */}
              <div className="overflow-auto whitespace-nowrap space-x-2 scrollbar-hide">
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
      
      <MapComponent
      keyword={keyword}
      height="400px"
      category={category} 
      categorys={["전체", "한식", "중식", "일식", "디저트", "카페", "기타"]} 
      onPlaceClick={(place: Place) => {
        console.log('마커 클릭했음', place)
        router.push(`/places/${place.id}`);
      }}
      />
sfkjlsdjlkfjsdkl
{/* <MapComponent
  // category={category} 
  // categorys={["전체", "한식", "중식", "일식", "디저트", "카페", "기타"]} 
  height="400px"
  onPlaceClick={(place: Place) => {
    console.log('마커 클릭했음', place)
    router.push(`/places/${place.id}`);
  }}
  selectable={true} // 등록 모드
  onSelectLocation={(lat, lng) => console.log(lat, lng)} // 등록 모드에서 좌표 선택 시
  marker={{ lat: 37.5, lng: 126.9 }} // 상세 모드
/> */}
sfkjlsdjlkfjsdkl
{/* <MapComponent
  // category={category} 
  // categorys={["전체", "한식", "중식", "일식", "디저트", "카페", "기타"]} 
  height="400px"
  onPlaceClick={(place: Place) => {
    console.log('마커 클릭했음', place)
    router.push(`/places/${place.id}`);
  }}
  selectable={false} // 등록 모드
  onSelectLocation={(lat, lng) => console.log(lat, lng)} // 등록 모드에서 좌표 선택 시
  marker={{ lat: 37.5, lng: 126.9 }} // 상세 모드
/> */}

      </section>
    </main>
  );
}
