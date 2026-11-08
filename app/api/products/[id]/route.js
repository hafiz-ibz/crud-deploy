import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

// Di Next.js 15, `params` adalah Promise dan harus di-await.
async function getId(params) {
  const { id } = await params;
  const num = Number(id);
  return Number.isInteger(num) && num > 0 ? num : null;
}

// GET /api/products/:id -> detail produk
export async function GET(_request, { params }) {
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil produk" }, { status: 500 });
  }
}

// PUT /api/products/:id -> ubah produk
export async function PUT(request, { params }) {
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const price = Number(body.price);

    if (!name) {
      return NextResponse.json({ error: "Nama produk wajib diisi" }, { status: 400 });
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Harga harus berupa angka >= 0" }, { status: 400 });
    }

    const [result] = await pool.query(
      "UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?",
      [name, description, price, id]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengubah produk" }, { status: 500 });
  }
}

// DELETE /api/products/:id -> hapus produk
export async function DELETE(_request, { params }) {
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
