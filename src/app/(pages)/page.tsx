"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocateFixed, MapIcon, PlusIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlaceStore } from "@/store/placeStore";
import { loadKakaoMap } from "@/utils/utils";
import { toast } from "react-hot-toast";
import MapComponent from "@/components/ui/mapComponent";

// 타입 먼저 선언
type MarkerWithOverlay = {
  marker: kakao.maps.Marker;
  customOverlay: kakao.maps.CustomOverlay;
};

export default function HomePage() {
  const mapRef = useRef<HTMLDivElement | null>(null); // mapRef = 지도 넣을 div와 연결된 ref
  const mapInstance = useRef<kakao.maps.Map | null>(null); // mapInstance = 지도 인스턴스
  const markersRef = useRef<MarkerWithOverlay[]>([]); // markersRef = 마커와 오버레이 정보를 저장할 배열
  const router = useRouter();
  const { fetchPlaces, places } = usePlaceStore();

  const [category, setCategory] = useState<string>("전체");
  const [keyword, setKeyword] = useState<string>("");

  const categoryRef = useRef(category); // 현재 카테고리 저장

  useEffect(() => {
    categoryRef.current = category; // 상태 바뀔 때마다 최신값 저장
  }, [category]);
  

  const getCategoryQuery = (category: string) => {
    const baseCategories = ["한식", "중식", "일식", "디저트", "카페"];
    if (category === "전체") return ""; // 전체 인 경우는 빈 문자열 반환한다(빈문자열 일경우 전체카테고리 불러온다)
    if (category === "기타") { // 기타 인 경우는 디폴트 카테고리에 없는 카테고리 일경우 불러온다
      return baseCategories
        .map((cat, index) => `&filters[category][$notIn][${index}]=${cat}`)
        .join("");
    }
    return `&filters[category][$eq]=${category}`; // 전체 또는 기타 둘다 아닌경우!!! 선택한 카테고리 불러온다
  };

  useEffect(() => {
    //useEffect 룰 활용해서 최초에만 실행되게 함
    //loadKakaoMap = 카카오 맵 스크립트 head에 삽입 후 콜백 실행(loadMap)
    loadKakaoMap(loadMap);
  }, []);

  // queryString = api 요청 할때 들어갈 주소 + 필터(쿼리) 값등등 (현재 지도 화면에 보이는 범위에 있는 리스트만 호출하는 쿼리)
  const queryString = (
    sw: kakao.maps.LatLng,
    ne: kakao.maps.LatLng,
    search?: string
  ): string => {
    return (
      `/places?filters[latitude][$gte]=${sw.getLat()}&filters[latitude][$lte]=${ne.getLat()}` + // 위도 범위 조건 
      `&filters[longitude][$gte]=${sw.getLng()}&filters[longitude][$lte]=${ne.getLng()}` + // 경도 범위 조건
      (search && keyword ? 
        `&filters[name][$eq]=${keyword}` // 카테고리 조건
        : 
        getCategoryQuery(categoryRef.current)) // 키워드 조건
    );
  };
  
  // updatePlacesByMapBounds = 위도, 경도 를 받아서 쿼리 문자열 생성 후 호출
  const updatePlacesByMapBounds = async (search?: string) => {
    const map = mapInstance.current;
    if (!map || !window.kakao) return;
  
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const query = queryString(sw, ne, search); // 위도, 경도 를 받아서 쿼리 문자열 생성
    await fetchPlaces(query); // api 호출
  };
  
  const handlePlaceClick = (id: string) => {
    router.push(`/places/${id}`);
  };

  const loadMap = async () => {
    // 아직 스크립트 로드 중이거나 map DOM이 준비 안 됐으면 중단
    if (!window.kakao || !mapRef.current) return;

    // 카카오 지도 인스턴스 생성 (초기 중심 좌표와 줌 레벨 설정)
    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // 최초 좌표(저건 현재 서울 시청
      level: 3, // 확대 레벨 (숫자가 낮을수록 확대됨)
    });

    mapInstance.current = map;

    // 지도 이동/줌 변경 시
    window.kakao.maps.event.addListener(map, "idle", updatePlacesByMapBounds);

    // 최초 실행 시
    updatePlacesByMapBounds();
  };

  // 마커 렌더링(places 에 의존해서 places값이 변경되면 재실행됨)
  useEffect(() => {
    if (!mapInstance.current || !window.kakao) return;
  
    const map = mapInstance.current;
  
    markersRef.current.forEach((item) => item.marker.setMap(null));
    markersRef.current = [];
  
    places.forEach((place) => {
      const { latitude, longitude, name, category } = place.attributes;
      const position = new window.kakao.maps.LatLng(latitude, longitude);
  
      const marker = new window.kakao.maps.Marker({
        position,
        map,
      });
  
      const content = document.createElement('div');
      content.innerHTML = `
        <div 
          class="custom-overlay-content inline-block bg-white rounded-md shadow-md px-[10px] py-[5px] text-[14px] whitespace-nowrap pointer-events-auto border border-gray-400 cursor-pointer"
        >
          <strong class="text-purple-600 text-[16px]">${name}</strong>
          <br />
          <span class="text-gray-500 text-[13px]">${category}</span>
        </div>
      `;
      // 리액트 onClick 으로는 이벤트 연결이 현재 형태에서는 안되기때문에 이렇게 스크립트로 직접 이벤트 부여함
      const innerDiv = content.querySelector(".custom-overlay-content");
      if (innerDiv) {
        innerDiv.addEventListener("click", () => handlePlaceClick(`${place.id}`));
      }


      const customOverlay = new window.kakao.maps.CustomOverlay({
        content,
        position,
        yAnchor: 1,
        map: null,
      });
  
      // 🛠 상태 관리용
      let hideTimeout: ReturnType<typeof setTimeout>;
  
      const showOverlay = () => {
        clearTimeout(hideTimeout);
        customOverlay.setMap(map);
      };
  
      const hideOverlay = () => {
        hideTimeout = setTimeout(() => {
          customOverlay.setMap(null);
        }, 200); // 살짝 delay
      };
  
      // 🖱 마커 이벤트
      window.kakao.maps.event.addListener(marker, 'mouseover', showOverlay);
      window.kakao.maps.event.addListener(marker, 'mouseout', hideOverlay);
  
      // 🖱 오버레이에도 이벤트 (깜빡임 방지)
      content.addEventListener('mouseenter', showOverlay);
      content.addEventListener('mouseleave', hideOverlay);
  
      markersRef.current.push({ marker, customOverlay });
    });
  }, [places]);
  

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);
    categoryRef.current = cat;
    updatePlacesByMapBounds(); // ✅ 직접 호출
  };

  const handleSearch = () => {
    updatePlacesByMapBounds('search');
    setCategory('전체');
  };


  const handleGoToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstance.current?.setCenter(new kakao.maps.LatLng(latitude, longitude));
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
  


  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-950 dark:to-gray-800 transition-colors duration-300">
      <section className="flex flex-col gap-4 px-4 pt-6 pb-32 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center text-purple-800 dark:text-purple-300">
          주변 맛집 찾기 ({category})
        </h1>

        <div className="flex gap-2">
          <Input placeholder="맛집 이름, 카테고리 검색" className="flex-1 text-base py-2" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
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

          {/* 📍 현재 위치 버튼 */}
          <Button
            variant="outline"
            size="icon"
            className="bg-white dark:bg-gray-800"
            onClick={handleGoToCurrentLocation}
          >
            <LocateFixed className="w-5 h-5 text-purple-600 dark:text-purple-300" />
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

        {/* 지도 영역 */}
        <div
          ref={mapRef}
          className="w-full h-[60vh] rounded-2xl shadow-xl border border-purple-200 dark:border-gray-700"
        >
        </div>
        {/* 지도 영역 */}

        {/* 맛집 추가 페이지로 이동 */}
        <Button
          onClick={() => router.push("/add")}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-xl text-white bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-400"
        >
          <PlusIcon className="w-6 h-6" />
        </Button>
        {/* 맛집 추가 버튼 */}




        <MapComponent
  markers={places.map(p => ({
    lat: p.attributes.latitude,
    lng: p.attributes.longitude,
    label: p.attributes.name
  }))}
  center={{ lat: 37.5665, lng: 126.9780 }}
  zoom={5}
/>


      </section>
    </main>
  );
}
