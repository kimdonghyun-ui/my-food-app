"use client";

import { useEffect, useState } from "react";
import { Place, usePlaceStore } from "@/store/placeStore";
import { useAuthStore } from "@/store/authStore";
import Pagination from "@/components/ui/pagination";
import MapComponent from "@/components/ui/mapComponent";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import LoadingOverlay from "@/components/LoadingOverlay";

interface Props {
  title?: string;
}

export default function MyPlaces({ title }: Props) {
  const { user } = useAuthStore();
  const { fetchPlaces, places, placesTotal, deletePlace, updatePlace, isLoading } = usePlaceStore();
  // const [lat, setLat] = useState(0);
  // const [lng, setLng] = useState(0);

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number }>({ lat: 37.5665, lng: 126.978 });
  const [page, setPage] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const PAGE_SIZE = 2;


  useEffect(() => {
    if (user?.id) {
      fetchPlaces(
        `/places?filters[users_permissions_user][id]=${user.id}&populate=*&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
      );
    }
  }, [user, page, fetchPlaces]);

  const totalPages = Math.ceil(placesTotal / PAGE_SIZE);

  const handleEditModal = (place: Place) => {
    setSelectedLocation({ lat: place.attributes.latitude, lng: place.attributes.longitude });

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
      { name: editedName, category: editedCategory, description: editedDesc, latitude: selectedLocation.lat, longitude: selectedLocation.lng, users_permissions_user: user?.id }
    );
    setEditModalOpen(false);
    // fetchPlaces(
    //   `/places?filters[users_permissions_user][id]=${user?.id}&populate=*&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
    // );
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-4 relative">
      <LoadingOverlay show={isLoading} />

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

          {/* 지도 모달 */}
          {/* 등록용 */}
          <MapComponent
        //   keyword={keyword} // 검색 키워드
          height="200px" // 놓이 
        //   category={category} // 카테고리
        //   categorys={categoryOptions}
        //   onPlaceClick={(place: Place) => {
        //     console.log('마커 클릭했음', place)
        //     router.push(`/places/${place.id}`);
        //   }}
          marker={{lat: selectedLocation.lat, lng: selectedLocation.lng}}
          selectable={true}
          onSelectLocation={(lat, lng) => {
            setSelectedLocation({ lat, lng });
            console.log('선택된 위치:', lat, lng);
          }}
        />

        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={handleUpdate}>저장</Button>
          <Button variant="outline" onClick={() => setEditModalOpen(false)}>
            취소
          </Button>
        </div>
      </Modal>

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

    </section>
  );
}
