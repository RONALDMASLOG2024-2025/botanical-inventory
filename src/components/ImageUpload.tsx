"use client";
import { useState, useRef } from "react";
import { validateImageFile, formatFileSize, resizeImage, uploadPlantImage } from "../lib/uploadImage";

type ImageUploadProps = {
  currentImageUrl?: string | null;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
  onUploadingChange?: (isUploading: boolean) => void;
  label?: string;
  required?: boolean;
};

export default function ImageUpload({ 
  currentImageUrl, 
  onImageUploaded, 
  onImageRemoved,
  onUploadingChange,
  label = "Plant Image",
  required = false 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    console.log("📁 File selected:", selectedFile.name, formatFileSize(selectedFile.size));

    // Validate file
    const validation = validateImageFile(selectedFile);
    if (!validation.isValid) {
      setError(validation.error || "Invalid file");
      console.error("❌ Validation failed:", validation.error);
      return;
    }

    setError(null);
    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }

  async function handleUpload() {
    if (!file) return;

    console.log("🚀 Starting upload process...");
    setUploading(true);
    onUploadingChange?.(true); // Notify parent component
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Resize image (30% progress)
      console.log("📐 Resizing image...");
      setUploadProgress(10);
      // Reduce quality to 0.7 for smaller file size (faster upload)
      const resizedFile = await resizeImage(file, 1200, 0.7);
      console.log("✅ Image resized:", formatFileSize(resizedFile.size));
      setUploadProgress(30);
      
      // Step 2: Upload to Supabase (90% progress)
      console.log("☁️ Uploading to Supabase...");
      setUploadProgress(40);
      
      const imageUrl = await uploadPlantImage(resizedFile);
      
      setUploadProgress(90);
      
      if (!imageUrl) {
        throw new Error("Upload returned no URL");
      }

      console.log("✅ Upload successful:", imageUrl);
      setUploadProgress(100);

      // Success - Call callback FIRST before clearing state
      console.log("📤 Calling onImageUploaded callback with URL:", imageUrl);
      onImageUploaded(imageUrl);
      
      // Small delay to ensure state updates propagate
      setTimeout(() => {
        setPreview(imageUrl);
        setFile(null);
        setUploading(false);
        onUploadingChange?.(false); // Notify parent component
        setUploadProgress(0);
      }, 100);

    } catch (err) {
      console.error("❌ Upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred during upload.";
      setError(errorMessage);
      setUploading(false);
      onUploadingChange?.(false); // Notify parent component
      setUploadProgress(0);
    }
  }

  function handleRemove() {
    setPreview(null);
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageRemoved?.();
  }

  function handleCancel() {
    setFile(null);
    setError(null);
    setPreview(currentImageUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Preview */}
      {preview && (
        <div className="relative rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-50">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover"
          />
          {!file && !uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
              title="Remove image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* File Input */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-emerald-50 file:text-emerald-700
            hover:file:bg-emerald-100
            cursor-pointer"
        />
      </div>

      {/* File Info */}
      {file && (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-emerald-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{file.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2 p-3 bg-[hsl(var(--primary)/0.05)] rounded-lg border border-[hsl(var(--primary)/0.2)]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[hsl(var(--foreground))] font-medium">
              {uploadProgress < 30 ? "Resizing image..." : 
               uploadProgress < 90 ? "Uploading to cloud..." : 
               "Finishing up..."}
            </span>
            <span className="font-semibold text-[hsl(var(--primary))]">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-[hsl(var(--secondary))] rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-[hsl(var(--primary))] h-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-slate-500">
        Supported formats: JPEG, PNG, WebP. Max size: 5MB. Images will be automatically optimized.
      </p>
    </div>
  );
}
