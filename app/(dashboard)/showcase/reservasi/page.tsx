import FeaturePreview from "@/components/FeaturePreview";

export default function ReservasiPage() {
  return (
    <FeaturePreview
      addOn="showcase"
      eyebrow="SHOWCASE · RESERVASI"
      title="Reservasi & Hold"
      desc="Kelola permintaan tahan barang (boutique) dan booking (F&B)."
      caps={[
        { title: "Tahan barang", desc: "'Tahan size M, saya datang coba' — pelanggan pesan, Anda tahan." },
        { title: "Antrian reservasi", desc: "Semua permintaan hold & booking dalam satu antrian rapi." },
        { title: "Konfirmasi & pengingat", desc: "Konfirmasi, atur batas waktu, dan ingatkan pelanggan." },
        { title: "Reservasi meja (F&B)", desc: "Booking meja: tanggal, jam, jumlah orang — menyusul." },
      ]}
    />
  );
}
