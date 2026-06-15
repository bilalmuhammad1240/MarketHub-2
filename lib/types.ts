// Corresponde à tabela "profiles" (equivalente à tabela "users"
// da especificação, seção 6.1).
export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  role: "user" | "admin";
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
  rejection_reason: string | null;
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

// O supabase-js, sem tipos gerados a partir do schema, infere recursos
// "embedded" (ex.: profiles(name)) como array, mesmo quando a relação é
// "um para muitos" do lado oposto (e o PostgREST devolve um objeto único
// em runtime). Este tipo cobre ambas as formas para permitir um acesso
// seguro e correto independentemente do formato devolvido.
export type SellerProfile = { name: string } | { name: string }[] | null;


