import { useState, useEffect } from "react";
import axiosInstance from "../api/instance";
import { Chapter } from "../types/Chapter";

export const useChapters = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        console.log("starting request");
        const response = await axiosInstance.get("/quran/chapters");
        setChapters(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  return { chapters, loading, error };
};
