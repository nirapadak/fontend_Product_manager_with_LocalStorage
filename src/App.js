import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

import './css/ProductDashboard.css';
const LOCAL_KEY = 'product_data';

export default function App() {
  const [products, setProducts] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [form, setForm] = useState({ name: '', sku: '', image: '', suppliers: [{ supplierId: '', price: '' }] });
  const [searchSKU, setSearchSKU] = useState('');

  useEffect(() => {
    const data = localStorage.getItem(LOCAL_KEY);
    if (data) setProducts(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(products));
  }, [products]);

  const handleAddSupplier = () => {
    setForm({ ...form, suppliers: [...form.suppliers, { supplierId: '', price: '' }] });
  };

  const handleSupplierChange = (index, field, value) => {
    const updatedSuppliers = [...form.suppliers];
    updatedSuppliers[index][field] = value;
    setForm({ ...form, suppliers: updatedSuppliers });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = { id: uuidv4(), ...form, ordered: false };
    setProducts([...products, newProduct]);
    setForm({ name: '', sku: '', image: '', suppliers: [{ supplierId: '', price: '' }] });
    setFormVisible(false);
  };

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleOrder = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, ordered: true } : p));
    setActiveTab('orders');
  };

  const handleEdit = (id, updatedField) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedField } : p));
  };

  const handleExport = () => {
    const dataToExport = products.map(p => ({
      Name: p.name,
      SKU: p.sku,
      Image: p.image,
      Suppliers: p.suppliers.map(s => `${s.supplierId}:${s.price}`).join(', ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'product_backup.xlsx');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const importedData = XLSX.utils.sheet_to_json(sheet);

      const formatted = importedData.map(item => ({
        id: uuidv4(),
        name: item.Name || '',
        sku: item.SKU || '',
        image: item.Image || '',
        ordered: false,
        suppliers: (item.Suppliers || '').split(',').map(s => {
          const [supplierId, price] = s.split(':');
          return { supplierId: supplierId.trim(), price: price.trim() };
        })
      }));

      setProducts([...products, ...formatted]);
    };

    reader.readAsArrayBuffer(file);
  };

  const filtered = products.filter(p => p.sku.toLowerCase().includes(searchSKU.toLowerCase()));
  const orderedProducts = products.filter(p => p.ordered);

  const groupedOrders = orderedProducts.reduce((acc, product) => {
    product.suppliers.forEach(supplier => {
      if (!acc[supplier.supplierId]) acc[supplier.supplierId] = [];
      acc[supplier.supplierId].push({ ...product, price: supplier.price });
    });
    return acc;
  }, {});

  return (
    <div className="app-container">
      <h1 className="dashboard-title">📦 Product Manager Dashboard</h1>

      <div className="tabs">
        <button onClick={() => setActiveTab('products')} className={`tab ${activeTab === 'products' ? 'active' : ''}`}>📋 Products</button>
        <button onClick={() => setActiveTab('orders')} className={`tab ${activeTab === 'orders' ? 'active' : ''}`}>🧾 Orders by Supplier</button>
      </div>

      {activeTab === 'products' && (
        <>
          <input type="text" placeholder="🔍 Search by SKU..." value={searchSKU} onChange={e => setSearchSKU(e.target.value)} className="search-input" />

          <div className="text-right mb-4">
            <button onClick={() => setFormVisible(!formVisible)} className="btn toggle-form">
              {formVisible ? 'Hide Create Form' : '➕ Create Product'}
            </button>
            <button onClick={handleExport} className="btn export">⬇ Export Excel</button>
            <label className="btn import">
              ⬆ Import Excel
              <input type="file" accept=".xlsx,.xls" onChange={handleImport} hidden />
            </label>
          </div>

          {formVisible && (
            <form onSubmit={handleSubmit} className="product-form animated fadeIn">
              <div className="form-group">
                <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
                <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input" />
                <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" />
              </div>

              {form.suppliers.map((s, i) => (
                <div key={i} className="supplier-input">
                  <input placeholder="Supplier ID" value={s.supplierId} onChange={(e) => handleSupplierChange(i, 'supplierId', e.target.value)} className="input" />
                  <input placeholder="Price" value={s.price} onChange={(e) => handleSupplierChange(i, 'price', e.target.value)} className="input" />
                </div>
              ))}

              <div className="button-group">
                <button type="button" onClick={handleAddSupplier} className="btn add">+ Add Supplier</button>
                <button type="submit" className="btn submit">✔ Create Product</button>
              </div>
            </form>
          )}

          <div className="product-table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Suppliers</th>
                  <th>QR</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className={product.ordered ? 'ordered' : ''}>
                    <td><img src={product.image} alt={product.name} className="table-img" /></td>
                    <td>
                      <input value={product.name} onChange={(e) => handleEdit(product.id, { name: e.target.value })} className="input table-edit" />
                    </td>
                    <td>{product.sku}</td>
                    <td>
                      {product.suppliers.map((s, i) => (
                        <div key={i} className="supplier">{s.supplierId} - ${s.price}</div>
                      ))}
                    </td>
                    <td><QRCodeCanvas value={product.sku} size={48} /></td>
                    <td>
                      <button onClick={() => handleOrder(product.id)} className="btn order">🚚</button>
                      <button onClick={() => handleDelete(product.id)} className="btn delete">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <div className="orders-wrapper">
          {Object.keys(groupedOrders).length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            Object.entries(groupedOrders).map(([supplierId, orders]) => (
              <div key={supplierId} className="supplier-orders">
                <h3>Supplier: {supplierId}</h3>
                <ul>
                  {orders.map((order, i) => (
                    <li key={i}>
                      {order.name} — SKU: {order.sku} — Price: ${order.price}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
