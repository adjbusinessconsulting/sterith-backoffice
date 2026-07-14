import FeaturePreview from "@/components/FeaturePreview";

export default function PelangganPage() {
  return (
    <FeaturePreview
      addOn="crm"
      eyebrow="CRM · PELANGGAN"
      title="Pelanggan"
      desc="Database pelanggan toko — siapa mereka, kontak, dan riwayat belanja."
      caps={[
        { title: "Database pelanggan", desc: "Simpan nama, WhatsApp, dan catatan tiap pelanggan dalam satu tempat." },
        { title: "Riwayat belanja", desc: "Lihat transaksi tiap pelanggan, otomatis dari POS." },
        { title: "Segmentasi", desc: "Kelompokkan: pelanggan aktif, jarang datang, atau pembeli besar." },
        { title: "Kontak cepat", desc: "Hubungi via WhatsApp langsung dari profil pelanggan." },
        { title: "Anti-duplikat", desc: "Gabung otomatis dari Hutang & Showcase — tidak ada '5 Budi'." },
      ]}
    />
  );
}
