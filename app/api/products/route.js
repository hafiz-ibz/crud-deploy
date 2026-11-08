import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/products -> daftar semua produk
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, description, price, created_at, updated_at FROM products ORDER BY id DESC"
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }
}

// POST /api/products -> tambah produk baru
export async function POST(request) {
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
      "INSERT INTO products (name, description, price) VALUES (?, ?, ?)",
      [name, description, price]
    );
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [result.insertId]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menambah produk" }, { status: 500 });
  }
}
