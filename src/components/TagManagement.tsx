import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image } from '@/types/Image';

interface TagManagementProps {
  image: Image;
  newTag: string;
  setNewTag: (value: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
}

const TagManagement: React.FC<TagManagementProps> = ({ image, newTag, setNewTag, addTag, removeTag }) => {
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Input
          id="newTagInput"
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Enter new tag"
          className="flex-grow"
        />
        <Button onClick={addTag}>Add Tag</Button>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Current Tags:</h2>
        <div className="flex flex-wrap gap-2">
          {image.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-sm">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-2 text-red-500">
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagManagement;
