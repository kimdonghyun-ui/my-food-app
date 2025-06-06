// "use client";

// import { useEffect, useState } from "react";
// import { Place, usePlaceStore } from "@/store/placeStore";
// import { useAuthStore } from "@/store/authStore";
// import Pagination from "@/components/ui/Pagination";
// import MapComponent from "./mapComponent";
// import Modal from "@/components/ui/modal";
// import { Button } from "@/components/ui/button";
// interface Props {
//   title?: string;
// }

// export default function MyPlaces({ title }: Props) {
//   const { user } = useAuthStore();
//   const { fetchPlaces, places, placesTotal, deletePlace } = usePlaceStore();
//   const [lat, setLat] = useState(0);
//   const [lng, setLng] = useState(0);
//   const [page, setPage] = useState(1);
//   const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
//   const PAGE_SIZE = 2;
//   const [isOpen, setIsOpen] = useState(false);
//   useEffect(() => {
//     if (user?.id) {
//       fetchPlaces(
//         `/places?filters[users_permissions_user][id]=${user.id}&populate=*&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
//       );
//     }
//   }, [user, page]);

//   const totalPages = Math.ceil(placesTotal / PAGE_SIZE);


//   const handleOpenModal = (place: Place) => {
//     setLat(place.attributes.latitude);
//     setLng(place.attributes.longitude);
//     setIsOpen(true);
//     // setSelectedPlace(place);
//     console.log('place', place)
//   };

//   return (
//     <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-4">
//       <h2 className="font-semibold text-base">{title}</h2>

//       {places.length > 0 ? (
//         <ul className="space-y-3">
//           {places.map((place) => (

//             <li key={place.id} className="border rounded-lg p-3 space-y-2">
//               <div>
//                 <p className="font-semibold text-sm">{place.attributes.name}</p>
//                 <p className="text-xs text-gray-600">{place.attributes.category}</p>
//                 <p className="text-sm text-gray-400">{place.attributes.description}</p>
//               </div>

//               {/* 👇 지도 삽입 */}
//               {/* <MapComponent
//                 center={{ lat: place.attributes.latitude, lng: place.attributes.longitude }}
//                 zoom={6}
//                 height="150px"
//               /> */}
// <Button onClick={() => handleOpenModal(place)}>모달 열기</Button>




//               <div className="flex justify-end gap-2">
//                 <button 
//                   className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
//                 >
//                   수정
//                 </button>
//                 <button 
//                   onClick={() => deletePlace(place.id)}
//                   className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
//                 >
//                   삭제
//                 </button>
//               </div>

//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p className="text-sm text-gray-500">등록한 맛집이 없습니다.</p>
//       )}


//         <Pagination
//           page={page}
//           totalPages={totalPages}
//           onChange={(newPage) => setPage(newPage)}
//         />
      
//       <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
//         <h2 className="text-lg font-bold mb-4">모달 제목</h2>
//         <div className="mb-4">


//         {/* 지도 */}
//         <MapComponent
//           // category={category} 
//           // categorys={["전체", "한식", "중식", "일식", "디저트", "카페", "기타"]} 
//           height="300px"
//           // onPlaceClick={(place: Place) => {
//           //   console.log('마커 클릭했음', place)
//           //   router.push(`/places/${place.id}`);
//           // }}
//           selectable={!true} // 등록 모드
//           onSelectLocation={(lat, lng) => {
//             console.log('lat, lng', lat, lng)
//             setLat(lat);
//             setLng(lng);
//           }} // 등록 모드에서 좌표 선택 시
//           marker={{ lat: lat, lng: lng }} // 상세 모드
//         />


//         </div>
//         <Button onClick={() => setIsOpen(false)}>닫기</Button>
//       </Modal>

//       {/* lat, lng 37.56576062803897 126.97654724772991 */}
//     </section>
//   );
// }








"use client";

import { useEffect, useState } from "react";
import { Place, usePlaceStore } from "@/store/placeStore";
import { useAuthStore } from "@/store/authStore";
import Pagination from "@/components/ui/Pagination";
import MapComponent from "@/components/ui/mapComponent";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

interface Props {
  title?: string;
}

export default function MyPlaces({ title }: Props) {
  const { user } = useAuthStore();
  const { fetchPlaces, places, placesTotal, deletePlace, updatePlace } = usePlaceStore();
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  // const [isOpen, setIsOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const PAGE_SIZE = 2;


  const [mapEdit, setMapEdit] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPlaces(
        `/places?filters[users_permissions_user][id]=${user.id}&populate=*&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
      );
    }
  }, [user, page]);

  const totalPages = Math.ceil(placesTotal / PAGE_SIZE);

  // const handleOpenModal = (place: Place) => {
  //   setLat(place.attributes.latitude);
  //   setLng(place.attributes.longitude);
  //   setIsOpen(true);
  // };

  const handleEditModal = (place: Place) => {
    setLat(place.attributes.latitude);
    setLng(place.attributes.longitude);

    setSelectedPlace(place);
    setEditedName(place.attributes.name);
    setEditedCategory(place.attributes.category);
    setEditedDesc(place.attributes.description || "");
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if(editedName === "") {
      toast.error("맛집 이름을 입력해주세요.");
      return;
    }
    if(editedCategory === "") { 
      toast.error("카테고리를 입력해주세요.");
      return;
    }
    if(editedDesc === "") {
      toast.error("설명을 입력해주세요.");
      return;
    }
    
    if (!selectedPlace) return;
    await updatePlace(selectedPlace.id, 
      { name: editedName, category: editedCategory, description: editedDesc, latitude: lat, longitude: lng, users_permissions_user: user?.id }
    );
    setEditModalOpen(false);
    // fetchPlaces(
    //   `/places?filters[users_permissions_user][id]=${user?.id}&populate=*&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
    // );
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-4">
      <h2 className="font-semibold text-base">{title}</h2>

      {places.length > 0 ? (
        <ul className="space-y-3">
          {places.map((place) => (
            <li key={place.id} className="border rounded-lg p-3 space-y-2">
              <div>
                <p className="font-semibold text-sm">{place.attributes.name}</p>
                <p className="text-xs text-gray-600">{place.attributes.category}</p>
                <p className="text-sm text-gray-400">{place.attributes.description}</p>
              </div>

              {/* <Button onClick={() => handleOpenModal(place)}>모달 열기</Button> */}

              <div className="flex justify-end gap-2">
                <button
                  className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                  onClick={() => handleEditModal(place)}
                >
                  수정
                </button>
                <button
                  onClick={() => deletePlace(place.id)}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">등록한 맛집이 없습니다.</p>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(newPage) => setPage(newPage)}
      />

      {/* 지도 모달 */}
      {/* <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-lg font-bold mb-4">위치 보기</h2>
        <div className="mb-4">

        </div>
        <Button onClick={() => setIsOpen(false)}>닫기</Button>
      </Modal> */}

      {/* 수정 모달 */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <h2 className="text-lg font-bold mb-4">맛집 수정</h2>
        <div className="space-y-4">
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="맛집 이름"
          />
          <Input
            value={editedCategory}
            onChange={(e) => setEditedCategory(e.target.value)}
            placeholder="카테고리"
          />
          <Textarea
            value={editedDesc}
            onChange={(e) => setEditedDesc(e.target.value)}
            placeholder="설명"
          />

          <MapComponent
            // category={category} 
            // categorys={["전체", "한식", "중식", "일식", "디저트", "카페", "기타"]} 
            height="300px"
            // onPlaceClick={(place: Place) => {
            //   console.log('마커 클릭했음', place)
            //   router.push(`/places/${place.id}`);
            // }}
            selectable={true} // 등록 모드
            onSelectLocation={(lat, lng) => {
              console.log('lat, lng', lat, lng)
              setLat(lat);
              setLng(lng);
              setMapEdit(false);
            }} // 등록 모드에서 좌표 선택 시
            marker={{ lat: lat, lng: lng }} // 상세 모드
            // marker={{ lat: 37.5, lng: 126.9 }} // 상세 모드
          />

        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={handleUpdate}>저장</Button>
          <Button variant="outline" onClick={() => setEditModalOpen(false)}>
            취소
          </Button>
        </div>
      </Modal>
    </section>
  );
}
