import { useState, useEffect } from "react";
import axiosInstance from "../api/instance";
import { Word } from "../types/Word";

export const useWords = (verseId: string) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axiosInstance.get(
          `/quran/verses/${verseId}/words`
        );
        setWords(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [verseId]);

  return { words, loading, error };
};
