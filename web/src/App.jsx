import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Html5Qrcode } from 'html5-qrcode'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export default function App() {
  const [products, setProducts] = useState([])
  const [barcode, setBarcode] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [stock, setStock] = useState(0)
  const scannerRef = useRef(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const res = await axios.get(`${API_BASE}/products`)
    setProducts(res.data)
  }

  async function addProduct(e) {
    e.preventDefault()
    await axios.post(`${API_BASE}/products`, { barcode, name, price: Number(price), stock: Number(stock) })
    setBarcode(''); setName(''); setPrice(0); setStock(0)
    fetchProducts()
  }

  function startScanner() {
    const qrRegionId = 'reader'
    if (scannerRef.current) return
    scannerRef.current = new Html5Qrcode(qrRegionId)
    scannerRef.current.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decoded) => {
        setBarcode(decoded)
        stopScanner()
      },
      (err) => {
        // ignore
      }
    ).catch(err => console.error(err))
  }

  function stopScanner() {
    if (!scannerRef.current) return
    scannerRef.current.stop().then(() => {
      scannerRef.current.clear()
      scannerRef.current = null
    }).catch(err => console.warn(err))
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Kios SkynCkz - Kios Mini App (Web)</h1>

      <section style={{ marginBottom: 20 }}>
        <h2>Tambah Produk</h2>
        <form onSubmit={addProduct}>
          <div>
            <label>Barcode: </label>
            <input value={barcode} onChange={e => setBarcode(e.target.value)} />
            <button type="button" onClick={startScanner}>Scan Barcode</button>
          </div>
          <div>
            <label>Nama: </label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label>Harga: </label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div>
            <label>Stok: </label>
            <input type="number" value={stock} onChange={e => setStock(e.target.value)} />
          </div>
          <button type="submit">Tambah</button>
        </form>

        <div id="reader" style={{ width: 300, height: 300, marginTop: 10 }}></div>
      </section>

      <section>
        <h2>Daftar Produk</h2>
        <table border="1" cellPadding="6">
          <thead>
            <tr><th>Nama</th><th>Barcode</th><th>Harga</th><th>Stok</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.barcode}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
