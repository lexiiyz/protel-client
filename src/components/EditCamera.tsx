"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type CameraForEdit = {
  id: number;
  name: string;
  location: string;
  ipAddress: string;
  username?: string;
  password?: string;
  channel?: string;
  status?: string;
};

type Props = {
  camera: CameraForEdit | null;     // null berarti modal tertutup / tidak ada camera untuk diedit
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

export default function EditCameraModal({ camera, open, onOpenChange, onUpdated }: Props) {
  const [form, setForm] = useState<CameraForEdit | null>(camera);

  useEffect(() => {
    setForm(camera);
  }, [camera]);

  if (!form) {
    // Render Dialog shell but closed (to avoid accidental undefined props)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kamera</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5005/api/cameras/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          location: form.location,
          ipAddress: form.ipAddress,
          username: form.username,
          password: form.password,
          channel: form.channel,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "server error");
        throw new Error(txt);
      }

      onUpdated();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Edit camera failed:", err);
      alert("Gagal menyimpan perubahan: " + (err.message || err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogTrigger isn't necessary here because MonitoringPage will control `open` */}
      <DialogContent className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Kamera</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <Input
            placeholder="Nama Kamera"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            placeholder="Lokasi"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
          <Input
            placeholder="IP Address"
            value={form.ipAddress}
            onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
            required
          />
          <Input
            placeholder="Username"
            value={form.username || ""}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password || ""}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Input
            placeholder="Channel RTSP"
            value={form.channel || ""}
            onChange={(e) => setForm({ ...form, channel: e.target.value })}
          />

          <div className="flex gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="bg-blue-600 text-white">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
