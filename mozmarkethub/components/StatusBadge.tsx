import type { ListingStatus } from "@/lib/types";

const STYLES: Record<ListingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-primary-dark",
  rejected: "bg-red-100 text-red-700",
};

const LABELS: Record<ListingStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

export default function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
