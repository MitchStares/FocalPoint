import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag } from 'lucide-react';

interface BulkTaggingProps {
  bulkTag: string;
  setBulkTag: (value: string) => void;
  applyBulkTag: () => void;
  selectedImagesCount: number;
}

const BulkTagging: React.FC<BulkTaggingProps> = ({ bulkTag, setBulkTag, applyBulkTag, selectedImagesCount }) => {
  return (
    <div className="flex gap-2 mb-4">
      <Input
        type="text"
        value={bulkTag}
        onChange={(e) => setBulkTag(e.target.value)}
        placeholder="Bulk tag"
        className="flex-grow"
      />
      <Button onClick={applyBulkTag} disabled={selectedImagesCount === 0}>
        <Tag className="mr-2 h-4 w-4" />
        Apply to Selected ({selectedImagesCount})
      </Button>
    </div>
  );
};

export default BulkTagging;
