import React from 'react';
import { Word } from '@/types/Word'; // Importing Word from the types folder

interface CommentarySectionProps {
  word: Word | null;
  wordDetails: any | null; // The word details fetched from the backend
  relatedWords: any[];
}

const CommentarySection: React.FC<CommentarySectionProps> = ({ word, wordDetails, relatedWords }) => {
  const highlightWord = (verse: string, targetWord: string) => {
    const parts = verse.split(new RegExp(`(${targetWord})`, 'g'));
    return parts.map((part, index) => 
      part === targetWord ? 
        <span key={index} className="bg-yellow-200 px-1 rounded">{part}</span> : 
        part
    );
  };
  console.log(relatedWords.map((item) => ({ word: item.relatedWord.word, verse: item.verse.verseString })));
  return (
    <div className="flex-1 bg-gray-50 p-4 border rounded-lg overflow-auto">
      <h2 className="text-lg font-bold mb-4">Commentary & Other Sections</h2>
      {!word && <p>Please select a word to see details and commentary.</p>}
      {word && wordDetails && (
        <div>
          <h3 className="text-xl font-bold mb-2">Word: {word.word}</h3>
          <p>{wordDetails.definition}</p>
          <p>Root: {word.rootWord}</p>
          <p>Lemmatized: {word.lemmatized}</p>

          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Related Verses</h4>
            <div className="space-y-4">
              {relatedWords.map((item, index) => (
                <div key={index} className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">
                    {item.verse.chapterName} ({item.verse.chapterNumber}:{item.verse.verseNumber})
                  </div>
                  <div className="text-right" dir="rtl" style={{ fontFamily: 'Scheherazade New, serif' }}>
                    {highlightWord(item.verse.verseString, item.relatedWord.word)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentarySection;
