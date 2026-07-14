import FeaturePreview from "@/components/FeaturePreview";

export default function DropsPage() {
  return (
    <FeaturePreview
      addOn="showcase"
      eyebrow="SHOWCASE · DROPS"
      title="Drops & Pengumuman"
      desc="Kabari pelanggan: promo, barang baru, dan drop khusus member."
      caps={[
        { title: "Pengumuman", desc: "Kirim promo & barang baru ke semua pelanggan aplikasi." },
        { title: "Member-only drops", desc: "Beri akses awal ke koleksi baru khusus member aplikasi." },
        { title: "Notifikasi restok", desc: "'Size M ready' — beri tahu pelanggan yang menunggu." },
        { title: "Broadcast", desc: "Push notifikasi ke aplikasi pelanggan, bukan sekadar posting." },
      ]}
    />
  );
}
