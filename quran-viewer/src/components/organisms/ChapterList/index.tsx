import React from 'react';
import { useChapters } from '@/hooks/chapters';

interface ChapterListProps {
  onSelectChapter: (chapterId: string) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ onSelectChapter }) => {
  const { chapters, loading, error } = useChapters();

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 px-4 pt-4">Chapters</h2>
      <div className="flex-1 overflow-y-auto">
        {loading && <p className="px-4">Loading chapters...</p>}
        {error && <p className="px-4">Error: {error}</p>}
        <ul className="space-y-2 px-4">
          {!loading &&
            chapters.map((chapter) => (
              <li
                key={chapter.id}
                className="hover:bg-gray-200 p-2 cursor-pointer rounded"
                onClick={() => onSelectChapter(chapter.id)}
              >
                {chapter.chapterName}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ChapterList;
