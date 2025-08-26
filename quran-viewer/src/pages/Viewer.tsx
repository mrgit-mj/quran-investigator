import React, { useState } from 'react';
import { CommentarySection, VersesView, ChapterList } from '@/components/organisms';
import { Word } from '@/types/Word'; // Importing Word from the types folder
import { useWordDetails } from '@/hooks/wordDetails'; // Hook for fetching word details
import { useRelatedWords } from '@/hooks/relatedWords';

const Viewer: React.FC = () => {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null); // Track the selected word object
  const { wordDetails, fetchWordDetails } = useWordDetails(); // Fetch word details in the parent
  const { relatedWords, fetchRelatedWords } = useRelatedWords();

  // Handle word click, set selected word and fetch word details
  const handleWordClick = async (word: Word) => {
    setSelectedWord(word);
    fetchWordDetails(word.word);
    fetchRelatedWords(word.id);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar for the chapters */}
      <div className="w-1/5 bg-gray-100 p-4">
        <ChapterList onSelectChapter={(chapterId: string) => setSelectedChapterId(chapterId)} />
      </div>

      {/* Main content area */}
      <div className="w-4/5 p-4 flex flex-col">
        {/* Top part: Quran verses view */}
        <div
          className={`${
            selectedWord ? 'h-3/4' : 'h-full'
          } bg-white p-4 border rounded-lg mb-4 overflow-auto`}
        >
          {selectedChapterId ? (
            <VersesView
              chapterId={selectedChapterId}
              onWordClick={handleWordClick} // Pass handleWordClick to VersesView
            />
          ) : (
            <div className="flex-grow bg-white p-4 border rounded-lg overflow-auto">
              <h2 className="text-2xl font-bold mb-4">Please select a chapter to view verses</h2>
            </div>
          )}
        </div>

        {/* Bottom part: Commentary or other sections */}
        {selectedWord && (
          <div className="h-1/4 bg-gray-50 p-4 border rounded-lg overflow-auto">
            <CommentarySection 
              word={selectedWord} 
              wordDetails={wordDetails}
              relatedWords={relatedWords}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewer;
