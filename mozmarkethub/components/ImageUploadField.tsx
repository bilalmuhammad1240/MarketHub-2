"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

export type ImageUploadFieldRef = {
  getFiles: () => File[];
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

type Props = {
  maxImages?: number;
  onError?: (message: string) => void;
};

const ImageUploadField = forwardRef<ImageUploadFieldRef, Props>(function ImageUploadField(
  { maxImages = 5, onError },
  ref
) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const pickerRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    getFiles: () => files,
  }));

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const remaining = Math.max(0, maxImages - files.length);

    const valid: File[] = [];
    for (const file of selected) {
      if (valid.length >= remaining) break;

      if (!ALLOWED_TYPES.includes(file.type)) {
        onError?.("As fotos devem ser JPG, PNG ou WEBP.");
        continue;
      }

      if (file.size > MAX_SIZE_BYTES) {
        onError?.("Cada foto deve ter no máximo 5MB.");
        continue;
      }

      valid.push(file);
    }

    if (valid.length > 0) {
      setFiles((prev) => [...prev, ...valid]);
    }

    if (pickerRef.current) {
      pickerRef.current.value = "";
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const canAddMore = files.length < maxImages;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {maxImages < 5 ? "Adicionar novas fotos" : `Fotos (até ${maxImages})`}
      </label>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {previews.map((src, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Foto ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeFile(index)}
              aria-label="Remover foto"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm font-bold text-white"
            >
              ×
            </button>
          </div>
        ))}

        {canAddMore && maxImages > 0 && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-primary hover:text-primary">
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs">Adicionar</span>
            <input
              ref={pickerRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handlePick}
            />
          </label>
        )}
      </div>

      {maxImages <= 0 ? (
        <p className="mt-1 text-xs text-gray-400">
          Limite de fotos atingido. Remova uma foto acima para adicionar outra.
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-400">
          Formatos JPG, PNG ou WEBP. Máximo 5MB por foto.
        </p>
      )}
    </div>
  );
});

export default ImageUploadField;
