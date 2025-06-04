"use client";

import { useEffect, useState } from "react";
import { usePlaceStore } from "@/store/placeStore";
import { useAuthStore } from "@/store/authStore";
import Pagination from "@/components/ui/Pagination";

interface Props {
  title?: string;
}

export default function MyPlaces({ title }: Props) {
  const { user } = useAuthStore();
  const { fetchPlaces, places, placesTotal, deletePlace } = usePlaceStore();

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 2;

  useEffect(() => {
    if (user?.id) {
      fetchPlaces(
        `/places?filters[users_permissions_user][id]=${user.id}&populate=*&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
      );
    }
  }, [user, page]);

  const totalPages = Math.ceil(placesTotal / PAGE_SIZE);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-4">
      <h2 className="font-semibold text-base">{title}</h2>

      {places.length > 0 ? (
        <ul className="space-y-3">
          {places.map((place) => (
            <li key={place.id} className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="font-semibold text-sm">{place.attributes.name}</p>
                <p className="text-xs text-gray-600">{place.attributes.category}</p>
                <p className="text-sm text-gray-400">{place.attributes.description}</p>
              </div>
              <div className="flex gap-1">
                <button className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">수정</button>
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
