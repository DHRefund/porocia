// src/components/ImageUploaderClient.tsx
"use client";

import { useState, useRef } from "react";

/**
 * Direct client‑side upload to Cloudinary using an **unsigned** upload preset.
 * The preset must be created in the Cloudinary console with "Unsigned" = true.
 *
 * The component receives a callback `onInsert` that will be called with the
 * standard markdown image syntax `![image](url)` once the upload finishes.
 */
type Props = {
  onInsert: (markdownToken: string) => void;
};

export default function ImageUploaderClient({ onInsert }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Missing Cloudinary env vars");
    }

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", uploadPreset);
    // Do NOT append resource_type here — it's handled by the URL path below

    // Use /image/upload for images (works reliably with unsigned presets)
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: form,
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      let errorMessage = "Upload failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (_) {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Return the secure URL directly — no need to reconstruct from public_id
    return data.secure_url as string;
  };

  const handleFile = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);

      // Insert standard markdown image syntax — works with react-markdown out of the box
      onInsert(`![image](${url})`);
    } catch (e) {
      console.error(e);
      alert("Upload ảnh thất bại: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-uploaded if needed
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 bg-cream text-stone rounded-lg hover:bg-cream/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all text-xs font-bold"
      >
        {uploading ? (
          <>
            <svg
              className="animate-spin w-3.5 h-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Đang tải…
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Thêm ảnh
          </>
        )}
      </button>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}