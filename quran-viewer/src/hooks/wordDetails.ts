import { useState } from "react";

export const useWordDetails = () => {
  const [wordDetails, setWordDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate an API call to fetch word details
  const fetchWordDetails = async (word: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate a delay to mimic an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Dummy word details for demonstration purposes
      const dummyData = {
        definition: `Definition for the word "${word}"`,
        root: `Root of the word "${word}"`,
        exampleUsage: `Example sentence using the word "${word}"`,
      };

      setWordDetails(dummyData);
    } catch (err) {
      setError("Failed to fetch word details.");
    } finally {
      setLoading(false);
    }
  };

  return { wordDetails, fetchWordDetails, loading, error };
};
