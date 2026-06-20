import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { ListingWithImages } from "@/lib/types";


export default function ListingCard({ listing }: { listing: ListingWithImages }) {
  const cover = listing.listing_images?.[0]?.image_url;

  return (
    <Link
      href={`/anuncios/${listing.id}`}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-gray-100">
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            Sem foto
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium text-gray-800">{listing.title}</p>
        <p className="mt-1 text-base font-bold text-primary-dark">
          {formatPrice(listing.price)}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">{listing.city}</p>
      </div>
    </Link>
  );
}


