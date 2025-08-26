import React, { useState } from 'react';
import { useVerses } from '@/hooks/verses';
import { Verse } from '@/types/Verse'; 
import { Word } from '@/types/Word'; 

interface VersesViewProps {
  chapterId: string;
  onWordClick: (word: Word) => void;
}

const VersesView: React.FC<VersesViewProps> = ({ chapterId, onWordClick }) => {
  const { verses, loading, error } = useVerses(chapterId);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null); // Track selected word

  // Special font for Quranic text
  const quranFont = 'Scheherazade New, serif';

  // Function to match words from verseString to the words array
  const matchWord = (wordString: string, wordsArray: Word[]) => {
    return wordsArray.find((wordObj) => wordObj.word === wordString);
  };

  // Sort verses by verse number in ascending order
  const sortedVerses = verses ? [...verses].sort((a: Verse, b: Verse) => a.verseNumber - b.verseNumber) : [];

  // Handle word click event
  const handleWordClick = (word: Word) => {
    setSelectedWordId(word.id); // Set the selected word's id
    onWordClick(word); // Trigger the passed onWordClick function
  };

  return (
    <div className="flex-2 bg-white p-4 border rounded-lg mb-4 overflow-auto">
      {loading && <p>Loading verses...</p>}
      {error && <p>Error: {error}</p>}
      <ul className="text-right" dir="rtl" style={{ fontFamily: quranFont }}>
        {!loading &&
          sortedVerses.map((verse) => {
            const isFirstVerse = verse.verseString === 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

            return (
              <li
                key={verse.id}
                className={isFirstVerse ? 'text-center font-bold text-3xl my-4' : 'my-2'}
                style={{
                  fontFamily: quranFont,
                  fontSize: isFirstVerse ? '2rem' : '1.25rem',
                }}
              >
                {isFirstVerse ? (
                  <span>{verse.verseString}</span>
                ) : (
                  <span>
                    {verse.verseNumber}.{' '}
                    {verse.verseString.split(' ').map((wordString, index) => {
                      const matchedWord = matchWord(wordString, verse.words);

                      // Style for clicked (selected) and unclicked words
                      const isSelected = matchedWord?.id === selectedWordId;
                      return (
                        <span
                          key={index}
                          onClick={() => matchedWord && handleWordClick(matchedWord)}
                          className={`cursor-pointer hover:bg-blue-200 transition-colors duration-300 ${
                            isSelected ? 'bg-blue-500 text-white' : ''
                          }`}
                          style={{
                            margin: '0 2px',
                            padding: '2px 4px',
                            borderRadius: '4px',
                          }}
                        >
                          {wordString}{' '}
                        </span>
                      );
                    })}
                  </span>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default VersesView;
