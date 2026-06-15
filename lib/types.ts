// Corresponde à tabela "profiles" (equivalente à tabela "users"
// da especificação, seção 6.1).
export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  created_at: string;
};

// Corresponde à tabela "listings" (especificação, seção 6.2).
export type ListingStatus = "pending" | "approved" | "rejected";

export type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  whatsapp: string;
  status: ListingStatus;
  created_at: string;
};

// Corresponde à tabela "listing_images" (especificação, seção 6.3).
export type ListingImage = {
  id: string;
  listing_id: string;
  image_url: string;
  created_at: string;
};

export type ListingWithImages = Listing & {
  listing_images: ListingImage[];
};

export type ListingWithSeller = ListingWithImages & {
  profiles: { name: string; phone: string | null } | null;
};

