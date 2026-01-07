"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import curlToJson from "@bany/curl-to-json";

interface AddCurlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeData: any) => void;
}

export function AddCurlModal({ isOpen, onClose, onSave }: AddCurlModalProps) {
  const [curl, setCurl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!curl.trim()) {
      toast.error("Please enter a curl command");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      const parsed = curlToJson(curl);
      const nodeData: { [key: string]: any } = {
        type: "api",
        label: name,
        name: name.toLowerCase().replace(/\s+/g, "_"),
        endpoint: parsed.url,
        method: parsed.method || "GET",
        // @ts-ignore
        headers: parsed.headers
          ? // @ts-ignore
            Object.entries(parsed.headers).map(([key, value]) => ({
              key,
              value: String(value),
              expression: "raw",
            }))
          : [],
      };

      let body: Array<{ [key: string]: any }> = [];
      if (parsed.data) {
        if (typeof parsed.data === "object" && parsed.data !== null) {
          body = Object.entries(parsed.data).map(([key, value]) => ({
            key,
            value: typeof value === "string" ? value : JSON.stringify(value),
            expression: "raw",
          }));
        } else {
          body = [
            { key: "body", value: String(parsed.data), expression: "raw" },
          ];
        }
      }

      nodeData.body = body;
      nodeData.description = description;

      onSave(nodeData);
      onClose();
      setCurl("");
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Error parsing curl:", error);
      toast.error("Invalid curl command");
    }
  };

  const handleCancel = () => {
    onClose();
    setCurl("");
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Curl</DialogTitle>
          <DialogDescription>
            Paste your curl command to create an API node.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter node name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="curl">Curl Command</Label>
            <Textarea
              id="curl"
              value={curl}
              onChange={(e) => setCurl(e.target.value)}
              placeholder="Paste your curl command here"
              rows={6}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
