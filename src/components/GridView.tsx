import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image } from '@/types/Image';
import MemoizedGridItem from './MemoizedGridItem';

interface GridViewProps {
  filteredImages: Image[];
  selectedImages: number[];
  toggleImageSelection: (id: number) => void;
  handleImageDoubleClick: (id: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  imagesPerPage: number;
}

const GridView: React.FC<GridViewProps> = ({
  filteredImages,
  selectedImages,
  toggleImageSelection,
  handleImageDoubleClick,
  currentPage,
  setCurrentPage,
  imagesPerPage,
}) => {
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);

  const handlePreviousPage = () => {
    setCurrentPage(Math.max(currentPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(currentPage + 1, totalPages));
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
        {filteredImages
          .slice((currentPage - 1) * imagesPerPage, currentPage * imagesPerPage)
          .map((image) => (
            <MemoizedGridItem
              key={image.id}
              image={image}
              selectedImages={selectedImages}
              toggleImageSelection={toggleImageSelection}
              handleImageDoubleClick={handleImageDoubleClick}
            />
          ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <Button 
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          First
        </Button>
        <Button 
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button 
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
        <Button 
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </Button>
      </div>
      <div className="mt-4 flex justify-center items-center gap-2">
        <Input
          type="number"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= totalPages) {
              setCurrentPage(page);
            }
          }}
          className="w-20"
        />
        <span>of {totalPages}</span>
        <Button onClick={() => {
          const input = document.querySelector('input[type="number"]') as HTMLInputElement;
          const page = parseInt(input.value);
          if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
          }
        }}>
          Go
        </Button>
      </div>
    </>
  );
};

export default GridView;