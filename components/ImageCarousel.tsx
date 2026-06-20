"use client";

import { useState } from "react";
import Image from "next/image";
import type { ListingImage } from "@/lib/types";

export default function ImageCarousel({ images }: { images: ListingImage[] }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400 sm:aspect-video">
        Sem fotos
      </div>
    );
  }

  function showPrevious() {
    setIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function showNext() {
    setIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 sm:aspect-video">
      <Image
        src={images[index].image_url}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 768px"
        className="object-cover"
        priority
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-lg text-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Foto seguinte"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-lg text-white"
          >
            ›
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((image, i) => (
              <span
                key={image.id}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

