import { useState } from "react";

export default function ProductForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "", sku: "", image: "", suppliers: [{ supplierId: "", price: "" }]
  });

  const handleAddSupplier = () => {
    setForm({ ...form, suppliers: [...form.suppliers, { supplierId: "", price: "" }] });
  };

  const handleChange = (index, field, value) => {
    const newSuppliers = [...form.suppliers];
    newSuppliers[index][field] = value;
    setForm({ ...form, suppliers: newSuppliers });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="SKU" onChange={(e) => setForm({ ...form, sku: e.target.value })} />
      <input placeholder="Image URL" onChange={(e) => setForm({ ...form, image: e.target.value })} />
      {form.suppliers.map((s, i) => (
        <div key={i}>
          <input placeholder="Supplier ID" onChange={(e) => handleChange(i, "supplierId", e.target.value)} />
          <input placeholder="Price" onChange={(e) => handleChange(i, "price", e.target.value)} />
        </div>
      ))}
      <button type="button" onClick={handleAddSupplier}>+ Add Supplier</button>
      <button type="submit">Create Product</button>
    </form>
  );
}
