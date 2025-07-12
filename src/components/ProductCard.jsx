import { useState } from "react";
import QRCode from "qrcode.react";

export default function ProductCard({ product, onUpdate, onDelete, onOrder }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(product.name);

  return (
    <div className={`p-4 border rounded-xl shadow-md ${product.ordered ? "bg-green-100" : "bg-white"}`}>
      <img src={product.image} alt={product.name} className="w-20 h-20" />
      <h2 className="text-lg font-semibold">SKU: {product.sku}</h2>
      <input value={name} disabled={!editing} onChange={(e) => setName(e.target.value)} />
      {editing ? (
        <button onClick={() => { onUpdate(product._id, { name }); setEditing(false); }}>Save</button>
      ) : (
        <button onClick={() => setEditing(true)}>Edit</button>
      )}
      <button onClick={() => onOrder(product._id)}>Order</button>
      <button onClick={() => onDelete(product._id)}>Delete</button>
      <QRCode value={product.sku} size={64} />
    </div>
  );
}
