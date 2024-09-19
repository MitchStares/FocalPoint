import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter } from 'lucide-react';
import { Image } from '@/types/Image'; // Make sure to import the Image type

interface FilterMenuProps {
  filterTag: string;
  setFilterTag: (value: string) => void;
  advancedFilters: {
    dateRange: [string, string];
    timeRange: [string, string];
    locations: string[];
    onlyTagged: boolean;
    onlyUntagged: boolean;
  };
  setAdvancedFilters: React.Dispatch<React.SetStateAction<{
    dateRange: [string, string];
    timeRange: [string, string];
    locations: string[];
    onlyTagged: boolean;
    onlyUntagged: boolean;
  }>>;
  applyFilters: () => void;
  images: Image[]; // Use the Image type here instead of any[]
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  filterTag,
  setFilterTag,
  advancedFilters,
  setAdvancedFilters,
  applyFilters,
  images
}) => {
  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value)}
        placeholder="Filter by tag"
        className="w-40"
      />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Date Range */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date Range</Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  type="date"
                  value={advancedFilters.dateRange[0]}
                  onChange={(e) => setAdvancedFilters(prev => ({...prev, dateRange: [e.target.value, prev.dateRange[1]]}))}
                />
                <Input
                  type="date"
                  value={advancedFilters.dateRange[1]}
                  onChange={(e) => setAdvancedFilters(prev => ({...prev, dateRange: [prev.dateRange[0], e.target.value]}))}
                />
              </div>
            </div>
            {/* Time Range */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Time Range</Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  type="time"
                  value={advancedFilters.timeRange[0]}
                  onChange={(e) => setAdvancedFilters(prev => ({...prev, timeRange: [e.target.value, prev.timeRange[1]]}))}
                />
                <Input
                  type="time"
                  value={advancedFilters.timeRange[1]}
                  onChange={(e) => setAdvancedFilters(prev => ({...prev, timeRange: [prev.timeRange[0], e.target.value]}))}
                />
              </div>
            </div>
            {/* Locations */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Locations</Label>
              <div className="col-span-3">
                {Array.from(new Set(images.map(img => img.metadata.location))).map(location => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={location}
                      checked={advancedFilters.locations.includes(location)}
                      onCheckedChange={(checked) => {
                        setAdvancedFilters(prev => ({
                          ...prev,
                          locations: checked
                            ? [...prev.locations, location]
                            : prev.locations.filter(l => l !== location)
                        }))
                      }}
                    />
                    <label htmlFor={location}>{location}</label>
                  </div>
                ))}
              </div>
            </div>
            {/* Only Tagged */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Only Tagged</Label>
              <Switch
                checked={advancedFilters.onlyTagged}
                onCheckedChange={(checked) => setAdvancedFilters(prev => ({...prev, onlyTagged: checked}))}
              />
            </div>
            {/* Only Untagged */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Only Untagged</Label>
              <Switch
                checked={advancedFilters.onlyUntagged}
                onCheckedChange={(checked) => setAdvancedFilters(prev => ({...prev, onlyUntagged: checked}))}
              />
            </div>
          </div>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilterMenu;
