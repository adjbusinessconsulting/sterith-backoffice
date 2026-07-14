import FeaturePreview from "@/components/FeaturePreview";

export default function KatalogPage() {
  return (
    <FeaturePreview
      addOn="showcase"
      eyebrow="SHOWCASE · KATALOG"
      title="Katalog & Etalase"
      desc="Etalase produk untuk aplikasi pelanggan — foto lookbook, stok live dari POS."
      caps={[
        { title: "Etalase produk", desc: "Tampilkan produk dengan foto lookbook/model, bukan sekadar thumbnail." },
        { title: "Stok live dari POS", desc: "Pelanggan lihat 'sisa 2' / 'habis' langsung dari kasir." },
        { title: "Kategori & koleksi", desc: "Kelompokkan produk jadi koleksi yang mudah dijelajah." },
        { title: "Kontrol tampil", desc: "Pilih produk mana yang muncul di etalase pelanggan." },
      ]}
    />
  );
}
