"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SettingsData {
  id: string;
  key: string;
  value: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsData[];
  onSave: (data: SettingsData[]) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [data, setData] = useState<SettingsData[]>([]);

  const handleAddData = () => {
    const newData: SettingsData = {
      id: `setting-${Date.now()}`,
      key: "",
      value: "",
    };
    setData([...data, newData]);
  };

  const handleRemoveData = (id: string) => {
    setData(data.filter((item) => item.id !== id));
  };

  const handleDataChange = (
    id: string,
    field: keyof SettingsData,
    value: string
  ) => {
    setData(
      data.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSave = () => {
    const validData = data.filter((item) => item.key.trim() !== "");
    validData.forEach((item) => {
      localStorage.setItem(item.key, item.value);
    });
    onClose();
  };

  useEffect(() => {
    setData([...settings]);
  }, [settings]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure application settings here.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto pr-4 -mr-4 max-h-[50vh]">
          <div className="space-y-6 py-2">
            {data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No settings configured yet.
              </div>
            ) : (
              data.map((item) => (
                <div key={item.id} className="grid gap-3 border-b pb-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Setting</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveData(item.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`key-${item.id}`}>Key</Label>
                      <Input
                        id={`key-${item.id}`}
                        value={item.key}
                        onChange={(e) =>
                          handleDataChange(item.id, "key", e.target.value)
                        }
                        placeholder="openRouterToken"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`value-${item.id}`}>Value</Label>
                      <Input
                        id={`value-${item.id}`}
                        value={item.value}
                        onChange={(e) =>
                          handleDataChange(item.id, "value", e.target.value)
                        }
                        placeholder="Enter value"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddData}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Setting
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
