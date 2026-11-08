"use client";

import { useEffect, useState } from "react";

const emptyForm = { name: "", description: "", price: "" };

const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n));

export default function Home() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal memuat data");
      setProducts(await res.json());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description ?? "", price: String(Number(p.price)) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      cancelEdit();
      await loadProducts();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p) {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      if (editingId === p.id) cancelEdit();
      await loadProducts();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="container">
      <h1>CRUD Produk</h1>
      <p className="subtitle">Next.js App Router + MySQL (Aiven) di Vercel</p>

      {error && <div className="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="card form">
        <h2>{editingId ? "Edit Produk" : "Tambah Produk"}</h2>
        <label>
          Nama
          <input name="name" value={form.name} onChange={handleChange} required maxLength={150} />
        </label>
        <label>
          Deskripsi
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
        </label>
        <label>
          Harga (Rp)
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>
        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah"}
          </button>
          {editingId && (
            <button type="button" className="secondary" onClick={cancelEdit}>
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="card">
        <h2>Daftar Produk</h2>
        {loading ? (
          <p>Memuat...</p>
        ) : products.length === 0 ? (
          <p>Belum ada produk.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>Deskripsi</th>
                  <th>Harga</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.description}</td>
                    <td>{rupiah(p.price)}</td>
                    <td className="row-actions">
                      <button className="secondary" onClick={() => startEdit(p)}>
                        Edit
                      </button>
                      <button className="danger" onClick={() => handleDelete(p)}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
