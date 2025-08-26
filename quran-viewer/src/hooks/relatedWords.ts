import { useState } from "react";
import axiosInstance from "../api/instance";

interface RelatedWord {
  relatedWord: {
    id: string;
    word: string;
    closeness: number;
  };
  parentWord: {
    id: string;
    word: string;
  };
  verse: {
    id: string;
    verseNumber: number;
    verseString: string;
    chapterName: string;
    chapterNumber: number;
  };
}

export const useRelatedWords = () => {
  const [relatedWords, setRelatedWords] = useState<RelatedWord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatedWords = async (wordId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/quran/words/related", {
        wordId,
        limit: 200,
      });
      setRelatedWords(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { relatedWords, fetchRelatedWords, loading, error };
};
