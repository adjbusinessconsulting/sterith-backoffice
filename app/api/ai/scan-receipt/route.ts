import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import Fuse from "fuse.js";

const SYSTEM = `Kamu membaca faktur/struk supplier untuk toko sembako di Indonesia.
Kembalikan JSON dengan schema tepat ini: {"supplier": "nama supplier", "invoiceNo": "nomor faktur atau null", "lines": [{"name": "nama produk", "qty": angka, "unitPrice": angka}]}.
Harga dalam rupiah (integer, tanpa titik/koma). Jika tidak yakin, kosongkan field tersebut. Balas HANYA dengan JSON valid.`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith("sk-ant-YOUR")) {
    return NextResponse.json({ error: "AI feature not configured" }, { status: 503 });
  }

  const form = await req.formData();
  const file = form.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });

  const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const mediaType = (file.type as "image/jpeg" | "image/png" | "image/webp") || "image/jpeg";

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const anthropic = new Anthropic();

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    system: SYSTEM,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
        { type: "text", text: "Ekstrak faktur ini. Balas hanya JSON valid." }
      ]
    }]
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  const products = await db.product.findMany({
    where: { storeId: session.user.storeId, deletedAt: null },
    select: { id: true, name: true, sku: true },
  });

  const fuse = new Fuse(products, { keys: ["name", "sku"], threshold: 0.4 });

  const lines = (parsed.lines ?? []).map((l: { name: string; qty: number; unitPrice: number }) => {
    const match = fuse.search(l.name)[0];
    return { ...l, skuGuess: match?.item.sku ?? null };
  });

  return NextResponse.json({ supplier: parsed.supplier ?? "", invoiceNo: parsed.invoiceNo ?? null, lines });
}
