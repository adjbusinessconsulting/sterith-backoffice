import FeaturePreview from "@/components/FeaturePreview";

export default function LoyaltiPage() {
  return (
    <FeaturePreview
      addOn="crm"
      eyebrow="CRM · LOYALTI"
      title="Program Loyalti"
      desc="Poin dan reward untuk pelanggan setia — otomatis dari transaksi POS."
      caps={[
        { title: "Poin belanja", desc: "Pelanggan dapat poin tiap transaksi. Atur nilai poin per rupiah." },
        { title: "Tingkatan member", desc: "Silver, Gold, dst. — makin sering belanja, makin tinggi tingkatnya." },
        { title: "Reward & voucher", desc: "Tukar poin jadi diskon atau hadiah yang Anda tentukan." },
        { title: "Otomatis dari POS", desc: "Poin dihitung otomatis dari penjualan, tanpa input manual." },
      ]}
    />
  );
}
