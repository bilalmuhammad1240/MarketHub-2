import { logout } from "@/app/auth/actions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full rounded-md border border-gray-300 px-4 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        Sair
      </button>
    </form>
  );
}
