import { useState, useEffect } from "react";
import axiosInstance from "../api/instance";
import { Verse } from "../types/Verse";

export const useVerses = (chapterId: string) => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerses = async () => {
      try {
        const response = await axiosInstance.get(
          `/quran/chapters/${chapterId}/verses`
        );
        setVerses(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, [chapterId]);

  return { verses, loading, error };
};
