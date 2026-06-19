"use client";

import { useState } from "react";
import Link from "next/link";
import { updateProfile } from "./actions";
import { MOZAMBIQUE_CITIES } from "@/lib/constants";
import type { Profile } from "@/lib/types";
import LogoutButton from "@/components/LogoutButton";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Nome</dt>
              <dd className="font-medium text-gray-900">{profile.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">WhatsApp / Telefone</dt>
              <dd className="font-medium text-gray-900">{profile.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Cidade</dt>
              <dd className="font-medium text-gray-900">{profile.city || "—"}</dd>
            </div>
          </dl>
        </div>

        <Link
          href="/meus-anuncios"
          className="block w-full rounded-md border border-gray-300 px-4 py-3 text-center text-base font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Os meus anúncios
        </Link>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="w-full rounded-md bg-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-primary-dark"
        >
          Editar perfil
        </button>

        <LogoutButton />
      </div>
    );
  }

  return (
    <form action={updateProfile} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={profile.name}
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={profile.email}
          disabled
          className="w-full rounded-md border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-500"
        />
        <p className="mt-1 text-xs text-gray-400">O email não pode ser alterado.</p>
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          WhatsApp / Telefone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={profile.phone ?? ""}
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label
          htmlFor="city"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Cidade
        </label>
        <select
          id="city"
          name="city"
          required
          defaultValue={profile.city ?? ""}
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="" disabled>
            Selecione a sua cidade
          </option>
          {MOZAMBIQUE_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-primary-dark"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
