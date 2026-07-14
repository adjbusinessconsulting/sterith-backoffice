import FeaturePreview from "@/components/FeaturePreview";

export default function ShowcasePengaturanPage() {
  return (
    <FeaturePreview
      addOn="showcase"
      eyebrow="SHOWCASE · PENGATURAN"
      title="Pengaturan Showcase"
      desc="Atur cara kerja etalase: engine aktif, tipe bisnis, dan tampilan."
      caps={[
        { title: "Engine aktif", desc: "Nyalakan / matikan Browse, Order, dan Reserve sesuai bisnis Anda." },
        { title: "Tipe bisnis", desc: "Boutique / F&B — pilih default yang pas untuk toko Anda." },
        { title: "Tampilan & branding", desc: "Warna, logo, dan gaya etalase yang dilihat pelanggan." },
        { title: "Link akun pelanggan", desc: "Hubungkan ke CRM untuk poin & riwayat belanja (opsional)." },
      ]}
    />
  );
}
