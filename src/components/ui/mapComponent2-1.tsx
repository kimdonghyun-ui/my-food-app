
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Place, usePlaceStore } from "@/store/placeStore";


interface MapComponentProps {
  keyword?: string;//검색 키워드
  height?: string;//놓이
  category?: string;//카테고리
  categorys?: string[];//카테고리 배열
  onPlaceClick?: (place: Place) => void;//마커 클릭 이벤트
  selectable?: boolean;//선택 가능 여부
  onSelectLocation?: (lat: number, lng: number) => void;//선택 위치 이벤트
  marker?: { lat: number; lng: number };//마커 위치
}

export default function MapComponent({
  keyword,//검색 키워드
  height = "300px",//놓이
  category = "전체",//카테고리
  categorys = [],//카테고리 배열
  onPlaceClick,//마커 클릭 이벤트
  selectable = false,//선택 가능 여부
  onSelectLocation,//선택 위치 이벤트
  marker,//마커 위치
  
}: MapComponentProps) {


  const [mapLoaded, setMapLoaded] = useState(false);


  // injectKakaoMapScript = 카카오 맵 스크립트 주입
  const injectKakaoMapScript = () => {
    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      // window.kakao.maps.load(() => setMapLoaded(true));
      window.kakao.maps.load(() => {
        setMapLoaded(true); // 스크립트 로드 완료후  mapLoaded 를 true로 설정
      });
    };
    document.head.appendChild(script);
  };

  useEffect(() => {
    if (document.getElementById("kakao-map-script")) {// 카카오 맵 스크립트가 있으면
      if (window.kakao) {// 카카오 맵 객체가 있으면
        window.kakao.maps.load(() => {
          setMapLoaded(true); // 이미 스크립트 로드 완료라서 mapLoaded 를 true로 설정
        });
      }
    } else {// 카카오 맵 스크립트가 없으면
      injectKakaoMapScript();// 카카오 맵 스크립트 주입
    }
  }, []);



  const { fetchPlaces, places } = usePlaceStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);


  const categoryRef = useRef(category);
  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  const keywordRef = useRef(keyword);
  useEffect(() => {
    keywordRef.current = keyword;
  }, [keyword]);












  const markersRef = useRef<{ marker: kakao.maps.Marker; overlay?: kakao.maps.CustomOverlay }[]>([]);


  // loadPlacesByBounds = useCallback 를 사용한이유가 useEffect 의존성 배열에 넣으면 리랜덩이이 일어나면서 무한 루프에 빠지기 때문이다.
  const loadPlacesByBounds = useCallback(async (bounds: kakao.maps.LatLngBounds) => {
    const currentCategory = categoryRef.current;
    const currentKeyword = keywordRef.current;
    if (!currentCategory) return;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();


    const getCategoryFilterParams = (category: string): string => {
      if (!categorys.length || category === "전체") return "";
      if (category === "기타") {
        return categorys
          .map((cat, i) => `&filters[category][$notIn][${i}]=${cat}`)
          .join("");
      }
      return `&filters[category][$eq]=${category}`;
    };


    const query =
    `/places?filters[latitude][$gte]=${sw.getLat()}&filters[latitude][$lte]=${ne.getLat()}` +
    `&filters[longitude][$gte]=${sw.getLng()}&filters[longitude][$lte]=${ne.getLng()}` +
    getCategoryFilterParams(currentCategory) +
    (currentKeyword && `&filters[name][$eq]=${currentKeyword}`);

    await fetchPlaces(query);
  }, [categorys, fetchPlaces, keyword, category]);


  useEffect(() => {  
    console.log('loadPlacesByBounds 호출됨')
    if (!mapLoaded || !window.kakao || !mapRef.current) return;
    console.log('loadPlacesByBounds 호출됨2')


    const { kakao } = window;
  
    let map = mapInstance.current;
  
    if (!map) {
      map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(37.5665, 126.978),
        level: 3,
      });
      mapInstance.current = map;
    }
  
    const bounds = map.getBounds();
    loadPlacesByBounds(bounds);
  
    const idleHandler = () => {
      const bounds = map!.getBounds();
      loadPlacesByBounds(bounds);
    };
  
    kakao.maps.event.addListener(map, "idle", idleHandler);
  
    return () => {
      // 👇 cleanup: 리스너 중복 방지
      kakao.maps.event.removeListener(map, "idle", idleHandler);
    };
  }, [mapLoaded, loadPlacesByBounds]);
  



  
  useEffect(() => {
    console.log('places 변경됨');
    console.log('places', places);
  
    // 1. 마커 초기화
    markersRef.current.forEach((item) => {
      item.marker.setMap(null);
    });
    
    markersRef.current = [];
  
    // 2. 지도 준비 안됐으면 중단
    if (!mapInstance.current || !window.kakao) return;
  
    const { kakao } = window;
  
    // 3. 새 마커 생성
    const newMarkers = places.map((place) => {
      const position = new kakao.maps.LatLng(place.attributes.latitude, place.attributes.longitude);
  
      const marker = new kakao.maps.Marker({
        position,
        map: mapInstance.current!,
      });
  
      // 🔍 마커 클릭 이벤트 핸들러 추가 (필요 시)
      if (onPlaceClick) {
        kakao.maps.event.addListener(marker, 'click', () => {
          onPlaceClick(place);
        });
      }
  
      return { marker };
    });
  
    // 4. 마커 저장
    markersRef.current = newMarkers;
  }, [places, onPlaceClick]);

return <div ref={mapRef} style={{ width: "100%", height }} />;

  useEffect(() => {
    if (!mapLoaded || !window.kakao || !mapRef.current) return;

    const { kakao } = window;

    if (mapInstance.current) {
      const bounds = mapInstance.current.getBounds();
      loadPlacesByBounds(bounds);
      return;
    }

    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 3,
    });
    mapInstance.current = map;

    // ✅ marker가 있으면 초기 마커 표시 (selectable 여부 관계없이)
    if (marker) {
      const pos = new kakao.maps.LatLng(marker.lat, marker.lng);
      const initialMarker = new kakao.maps.Marker({ position: pos, map });
      markersRef.current.push({ marker: initialMarker });
      map.setCenter(pos);
    }

    // ✅ selectable일 때 클릭으로 마커 찍기
    if (selectable && onSelectLocation) {
      // kakao.maps.event.addListener(map, "click", (e: any) => {
      //   const latlng = e.latLng;
      //   onSelectLocation(latlng.getLat(), latlng.getLng());

      //   markersRef.current.forEach(({ marker }: any) => marker.setMap(null));
      //   markersRef.current = [];

      //   const marker = new kakao.maps.Marker({ position: latlng, map });
      //   markersRef.current.push({ marker });
      // });
      kakao.maps.event.addListener(map, "click", (e: { latLng: kakao.maps.LatLng }) => {
        const latlng = e.latLng;
        onSelectLocation(latlng.getLat(), latlng.getLng());
      
        markersRef.current.forEach(({ marker }) => marker.setMap(null));
        markersRef.current = [];
      
        const marker = new kakao.maps.Marker({ position: latlng, map });
        markersRef.current.push({ marker });
      });
      
    }

    // ✅ 일반 지도일 경우 idle에 따라 장소 불러오기
    if (!selectable && !marker) {
      kakao.maps.event.addListener(map, "idle", () => {
        const bounds = map.getBounds();
        loadPlacesByBounds(bounds);
      });

      const bounds = map.getBounds();
      loadPlacesByBounds(bounds);
    }
  }, [mapLoaded, category, keyword, loadPlacesByBounds, marker, onSelectLocation, selectable]);

  useEffect(() => {
    if (!mapInstance.current || !window.kakao || selectable || marker) return;
    const map = mapInstance.current;
    const { kakao } = window;

    // markersRef.current.forEach(({ marker }: any) => marker.setMap(null));
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];

    places.forEach((place) => {
      const { latitude, longitude, name, category } = place.attributes;
      const position = new kakao.maps.LatLng(latitude, longitude);
      const marker = new kakao.maps.Marker({ position, map });

      const content = document.createElement("div");
      content.innerHTML = `
        <div class="custom-overlay-content inline-block bg-white rounded-md shadow-md px-[10px] py-[5px] text-[14px] whitespace-nowrap pointer-events-auto border border-gray-400 cursor-pointer">
          <strong class="text-purple-600 text-[16px]">${name}</strong><br />
          <span class="text-gray-500 text-[13px]">${category}</span>
        </div>`;

      const overlay = new kakao.maps.CustomOverlay({
        content,
        position,
        yAnchor: 1,
        map: null,
      });

      const show = () => overlay.setMap(map);
      const hide = () => setTimeout(() => overlay.setMap(null), 200);

      kakao.maps.event.addListener(marker, "mouseover", show);
      kakao.maps.event.addListener(marker, "mouseout", hide);
      content.addEventListener("mouseenter", show);
      content.addEventListener("mouseleave", hide);

      const div = content.querySelector(".custom-overlay-content");
      if (div && onPlaceClick) div.addEventListener("click", () => onPlaceClick(place));

      markersRef.current.push({ marker, overlay });
    });
  }, [places,onPlaceClick, marker, selectable]);

  return <div ref={mapRef} style={{ width: "100%", height }} />;
}
