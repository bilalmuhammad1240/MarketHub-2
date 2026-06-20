import type { NextConfig } from "next";

// Deriva o hostname do Supabase a partir da variável de ambiente, em vez
// de o escrever à mão — assim nunca fica desatualizado se o projeto
// Supabase mudar. O hostname NÃO deve incluir "https://" nem caminho:
// o campo "hostname" do remotePatterns só aceita o domínio
// (ex.: "kssfbnchykjgmvichbtn.supabase.co").
function getSupabaseHostname(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    // Em builds sem a variável definida (ex.: lint local sem .env),
    // não falhamos o build — caímos para qualquer host https como rede
    // de segurança.
    return "**";
  }

  try {
    return new URL(url).hostname;
  } catch {
    return "**";
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: getSupabaseHostname(),
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
