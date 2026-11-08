const STYLES: Record<string, string> = {
  nouvelle: "bg-blush-soft text-mauve-deep",
  confirmee: "bg-[#F1E9D9] text-[#8A6D3B]",
  en_preparation: "bg-[#E5EEE5] text-[#4F6B52]",
  en_livraison: "bg-[#E3E9F2] text-[#4A5D77]",
  livree: "bg-[#E1EFE9] text-[#3E7A63]",
  annulee: "bg-[#EDEAEB] text-[#8A8386]",
};

const LABELS: Record<string, string> = {
  nouvelle: "Nouvelle commande",
  confirmee: "Confirmée",
  en_preparation: "En préparation",
  en_livraison: "En livraison",
  livree: "Livrée",
  annulee: "Annulée",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium tracking-wide ${
        STYLES[status] ?? "bg-cream text-ink-soft"
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
