// import React, { useEffect, useState, useRef } from 'react';
// import { QRCodeCanvas } from 'qrcode.react';
// import { v4 as uuidv4 } from 'uuid';
// import * as XLSX from 'xlsx';

// import './css/ProductDashboard.css';
// const LOCAL_KEY = 'product_data';

// export default function App() {
//   const [products, setProducts] = useState([]);
//   const [formVisible, setFormVisible] = useState(false);
//   const [activeTab, setActiveTab] = useState('products');
//   const [form, setForm] = useState({ name: '', sku: '', image: '', suppliers: [{ supplierId: '', price: '' }] });
//   const [searchSKU, setSearchSKU] = useState('');

//   useEffect(() => {
//     const data = localStorage.getItem(LOCAL_KEY);
//     if (data) setProducts(JSON.parse(data));
//   }, []);

// const firstRenderRef = useRef(true);

// useEffect(() => {
//   if (firstRenderRef.current) {
//     firstRenderRef.current = false;
//     return; // skip saving on first render
//   }
//   localStorage.setItem(LOCAL_KEY, JSON.stringify(products));
// }, [products]);


  
//   const handleAddSupplier = () => {
//     setForm({ ...form, suppliers: [...form.suppliers, { supplierId: '', price: '' }] });
//   };

//   const handleSupplierChange = (index, field, value) => {
//     const updatedSuppliers = [...form.suppliers];
//     updatedSuppliers[index][field] = value;
//     setForm({ ...form, suppliers: updatedSuppliers });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const newProduct = { id: uuidv4(), ...form, ordered: false, quantity: 1 };
//     setProducts([...products, newProduct]);
  


//     setForm({ name: '', sku: '', image: '', suppliers: [{ supplierId: '', price: '' }] });
//     setFormVisible(false);
//   };

//   const handleDelete = (id) => {
//     setProducts(products.filter(p => p.id !== id));
//   };



//   const handleOrder = (id) => {
//   setProducts(products.map(p => {
//     if (p.id === id) {
//       // Find the supplier with the lowest price
//       const cheapest = p.suppliers.reduce((min, curr) =>
//         parseFloat(curr.price) < parseFloat(min.price) ? curr : min
//       );

//       return {
//         ...p,
//         ordered: true,
//         orderedSupplierId: cheapest.supplierId,
//         orderedPrice: cheapest.price,
//       };
//     }
//     return p;
//   }));

//   setActiveTab('orders');
// };


//   const handleEdit = (id, updatedField) => {
//     setProducts(products.map(p => p.id === id ? { ...p, ...updatedField } : p));
//   };

//   const handleExport = () => {
//     const dataToExport = products.map(p => ({
//       Name: p.name,
//       SKU: p.sku,
//       Image: p.image,
//       Suppliers: p.suppliers.map(s => `${s.supplierId}:${s.price}`).join(', ')
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
//     XLSX.writeFile(workbook, 'product_backup.xlsx');
//   };

//   const handleImport = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const data = new Uint8Array(evt.target.result);
//       const workbook = XLSX.read(data, { type: 'array' });
//       const sheetName = workbook.SheetNames[0];
//       const sheet = workbook.Sheets[sheetName];
//       const importedData = XLSX.utils.sheet_to_json(sheet);

//       const formatted = importedData.map(item => ({
//         id: uuidv4(),
//         name: item.Name || '',
//         sku: item.SKU || '',
//         image: item.Image || '',
//         ordered: false,
//         quantity: 1,
//         suppliers: (item.Suppliers || '').split(',').map(s => {
//           const [supplierId, price] = s.split(':');
//           return { supplierId: supplierId.trim(), price: price.trim() };
//         })
//       }));

//       setProducts([...products, ...formatted]);
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   const filtered = products.filter(p => p.sku.toLowerCase().includes(searchSKU.toLowerCase()));
//   const orderedProducts = products.filter(p => p.ordered);


//   const groupedOrders = orderedProducts.reduce((acc, product) => {
//   const sid = product.orderedSupplierId;
//   if (!acc[sid]) acc[sid] = [];
//   acc[sid].push({ ...product, price: product.orderedPrice });
//   return acc;
// }, {});


//   const handleQuantityChange = (id, value) => {
//     setProducts(products.map(p => p.id === id ? { ...p, quantity: Number(value) } : p));
//   };

//   const handleRemoveOrder = (id) => {
//     setProducts(products.map(p => p.id === id ? { ...p, ordered: false, quantity: 1 } : p));
//   };

//   return (
//     <div className="app-container">
//       <h1 className="dashboard-title">📦 Product Manager Dashboard</h1>

//       <div className="tabs">
//         <button onClick={() => setActiveTab('products')} className={`tab ${activeTab === 'products' ? 'active' : ''}`}>📋 Products</button>
//         <button onClick={() => setActiveTab('orders')} className={`tab ${activeTab === 'orders' ? 'active' : ''}`}>🧾 Orders by Supplier</button>
//       </div>

//       {activeTab === 'products' && (
//         <>
//           <input type="text" placeholder="🔍 Search by SKU..." value={searchSKU} onChange={e => setSearchSKU(e.target.value)} className="search-input" />

//           <div className="text-right mb-4">
//             <button onClick={() => setFormVisible(!formVisible)} className="btn toggle-form">
//               {formVisible ? 'Hide Create Form' : '➕ Create Product'}
//             </button>
//             <button onClick={handleExport} className="btn export">⬇ Export Excel</button>
          
//             <label className="btn import">
//               ⬆ Import Excel
//               <input type="file" accept=".xlsx,.xls" onChange={handleImport} hidden />
//               </label>
              
//           </div>

//           {formVisible && (
//             <form onSubmit={handleSubmit} className="product-form animated fadeIn">
//               <div className="form-group">
//                 <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
//                 <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input" />
//                 <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" />
//               </div>

//               {form.suppliers.map((s, i) => (
//                 <div key={i} className="supplier-input">
//                   <input placeholder="Supplier ID" value={s.supplierId} onChange={(e) => handleSupplierChange(i, 'supplierId', e.target.value)} className="input" />
//                   <input placeholder="Price" value={s.price} onChange={(e) => handleSupplierChange(i, 'price', e.target.value)} className="input" />
//                 </div>
//               ))}

//               <div className="button-group">
//                 <button type="button" onClick={handleAddSupplier} className="btn add">+ Add Supplier</button>
//                 <button type="submit" className="btn submit">✔ Create Product</button>
//               </div>
//             </form>
//           )}

//           <div className="product-table-wrapper">
//             <table className="product-table">
//               <thead>
//                 <tr>
//                   <th>Image</th>
//                   <th>Name</th>
//                   <th>SKU</th>
//                   <th>Suppliers</th>
//                   <th>QR</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((product) => (
//                   <tr key={product.id} className={product.ordered ? 'ordered' : ''}>
//                     <td><img src={product.image} alt={product.name} className="table-img" /></td>
//                     <td>
//                       <input value={product.name} onChange={(e) => handleEdit(product.id, { name: e.target.value })} className="input table-edit" />
//                     </td>
//                     <td>{product.sku}</td>
//                     <td>
//                       {product.suppliers.map((s, i) => (
//                         <div key={i} className="supplier">{s.supplierId} - ${s.price}</div>
//                       ))}
//                     </td>
//                     <td><QRCodeCanvas value={product.sku} size={48} /></td>
//                     <td>
//                       <button onClick={() => handleOrder(product.id)} className="btn order">🚚</button>
//                       <button onClick={() => handleDelete(product.id)} className="btn delete">🗑</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}

//       {activeTab === 'orders' && (
//         <div className="orders-wrapper">
//           {Object.keys(groupedOrders).length === 0 ? (
//             <p>No orders yet.</p>
//           ) : (
//             Object.entries(groupedOrders).map(([supplierId, orders]) => (
//               <div key={supplierId} className="supplier-orders">
//                 <h3>Supplier: {supplierId}</h3>
//                 <table className="order-table">
//                   <thead>
//                     <tr>
//                       <th>Image</th>
//                       <th>Name</th>
//                       <th>SKU</th>
//                       <th>Quantity</th>
//                       <th>Remove</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {orders.map((order, i) => (
//                       <tr key={i}>
//                         <td><img src={order.image} alt={order.name} className="table-img" /></td>
//                         <td>{order.name}</td>
//                         <td>{order.sku}</td>
//                         <td>
//                           <input
//                             type="number"
//                             min="1"
//                             value={order.quantity}
//                             onChange={(e) => handleQuantityChange(order.id, e.target.value)}
//                             className="input table-edit"
//                           />
//                         </td>
                    
//                         <td>
//                           <button onClick={() => handleRemoveOrder(order.id)} className="btn delete">✖</button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


// Full updated React code with supplier CRUD and selectable suppliers in product creation

import React, { useEffect, useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import './css/ProductDashboard.css';
  import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LOCAL_KEY_PRODUCTS = 'product_data';
const LOCAL_KEY_SUPPLIERS = 'supplier_data';

export default function App() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', id: '' });
  const [form, setForm] = useState({ name: '', sku: '', image: '', suppliers: [{ supplierId: '', price: '' }] });
  const [activeTab, setActiveTab] = useState('products');
  const [searchSKU, setSearchSKU] = useState('');

  const firstRenderRef = useRef(true);

  useEffect(() => {
    const prod = localStorage.getItem(LOCAL_KEY_PRODUCTS);
    const supp = localStorage.getItem(LOCAL_KEY_SUPPLIERS);
    if (prod) setProducts(JSON.parse(prod));
    if (supp) setSuppliers(JSON.parse(supp));
  }, []);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    localStorage.setItem(LOCAL_KEY_PRODUCTS, JSON.stringify(products));
    localStorage.setItem(LOCAL_KEY_SUPPLIERS, JSON.stringify(suppliers));
  }, [products, suppliers]);

  const handleAddSupplierField = () => {
    setForm({ ...form, suppliers: [...form.suppliers, { supplierId: '', price: '' }] });
  };

  const handleSupplierChange = (index, field, value) => {
    const updated = [...form.suppliers];
    updated[index][field] = value;
    setForm({ ...form, suppliers: updated });
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const newProduct = { id: uuidv4(), ...form, ordered: false, quantity: 1 };
    setProducts(prev => [...prev, newProduct]);
    setForm({ name: '', sku: '', image: '', suppliers: [{ supplierId: '', price: '' }] });
    setFormVisible(false);
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleOrder = (id) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const cheapest = p.suppliers.reduce((min, curr) =>
          parseFloat(curr.price) < parseFloat(min.price) ? curr : min
        );
        return {
          ...p,
          ordered: true,
          orderedSupplierId: cheapest.supplierId,
          orderedPrice: cheapest.price,
        };
      }
      return p;
    }));
    setActiveTab('orders');
  };

  const handleEditProduct = (id, updatedField) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedField } : p));
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (supplierForm.name.trim()) {
      setSuppliers(prev => [...prev, { id: uuidv4(), name: supplierForm.name.trim() }]);
      setSupplierForm({ name: '', id: '' });
    }
  };

  const handleDeleteSupplier = (id) => {
    const inUse = products.some(product =>
      product.suppliers.some(s => s.supplierId === id)
    );

    if (inUse) {
      alert('❌ Cannot delete: Supplier is used in products!');
      return;
    }

    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const handleEditSupplier = (id, name) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, name } : s));
  };

  const filtered = products.filter(p => p.sku.toLowerCase().includes(searchSKU.toLowerCase()));
  const orderedProducts = products.filter(p => p.ordered);
  const groupedOrders = orderedProducts.reduce((acc, product) => {
    const sid = product.orderedSupplierId;
    if (!acc[sid]) acc[sid] = [];
    acc[sid].push({ ...product, price: product.orderedPrice });
    return acc;
  }, {});

  const handleQuantityChange = (id, value) => {
    setProducts(products.map(p => p.id === id ? { ...p, quantity: Number(value) } : p));
  };

  const handleRemoveOrder = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, ordered: false, quantity: 1 } : p));
  };


  // emprot and exprot ==========================================================

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
        quantity: 1,
        suppliers: (item.Suppliers || '').split(',').map(s => {
          const [supplierId, price] = s.split(':');
          return { supplierId: supplierId.trim(), price: price.trim() };
        })
      }));

      setProducts([...products, ...formatted]);
    };

    reader.readAsArrayBuffer(file);
  };



  // export order PDF create button function ==============================================================


const exportOrdersToPDF = () => {
  const doc = new jsPDF();
  let y = 10;

  Object.entries(groupedOrders).forEach(([sid, orders], index) => {
    const supplier = suppliers.find(s => s.id === sid);
    const supplierName = supplier?.name || `Supplier ${sid}`;
    const tableData = [];

    let totalQuantity = 0;
    let totalPrice = 0;

    orders.forEach((o, i) => {
      const qty = Number(o.quantity);
      const price = Number(o.price);
      const subtotal = qty * price;

      tableData.push([
        i + 1,
        o.name,
        o.sku,
        qty,
        `$${price.toFixed(2)}`,
        `$${subtotal.toFixed(2)}`
      ]);

      totalQuantity += qty;
      totalPrice += subtotal;
    });

    if (index !== 0) doc.addPage();

    doc.setFontSize(16);
    doc.text(`Supplier: ${supplierName}`, 14, y);

    autoTable(doc, {
      startY: y + 6,
      head: [['#', 'Name', 'SKU', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
    });

    const finalY = doc.lastAutoTable.finalY || 10;
    doc.setFontSize(12);
    doc.text(`Total Quantity: ${totalQuantity}`, 14, finalY + 10);
    doc.text(`Total Price: $${totalPrice.toFixed(2)}`, 14, finalY + 16);
  });

  doc.save('supplier_orders_report.pdf');
};

  
  
  //  all pdf ====================================================================================


const exportAllOrdersPDF = () => {
  const doc = new jsPDF();
  let isFirstPage = true;

  Object.entries(groupedOrders).forEach(([sid, orders], index) => {
    if (!isFirstPage) doc.addPage();
    isFirstPage = false;

    const supplier = suppliers.find(s => s.id === sid);
    const supplierName = supplier?.name || `Supplier ${sid}`;

    let totalQty = 0;
    let totalAmount = 0;

    const rows = orders.map((o, i) => {
      const qty = Number(o.quantity);
      const unitPrice = Number(o.price);
      const total = qty * unitPrice;

      totalQty += qty;
      totalAmount += total;

      return [
        i + 1,
        o.name,
        o.sku,
        qty,
        `$${unitPrice.toFixed(2)}`,
        `$${total.toFixed(2)}`
      ];
    });

    doc.setFontSize(16);
    doc.text(`Supplier: ${supplierName}`, 14, 14);

    autoTable(doc, {
      startY: 20,
      head: [['#', 'Product Name', 'SKU', 'Qty', 'Unit Price', 'Total']],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    const finalY = doc.lastAutoTable.finalY || 30;
    doc.setFontSize(12);
    doc.text(`Total Quantity: ${totalQty}`, 14, finalY + 10);
    doc.text(`Total Price: $${totalAmount.toFixed(2)}`, 14, finalY + 18);
  });

  doc.save('All_Supplier_Orders.pdf');
};


  return (
    <div className="app-container">
      <h1 className="dashboard-title">📦 Product Manager Dashboard</h1>

      <div className="tabs">
        <button onClick={() => setActiveTab('products')} className={`tab ${activeTab === 'products' ? 'active' : ''}`}>📋 Products</button>
        <button onClick={() => setActiveTab('orders')} className={`tab ${activeTab === 'orders' ? 'active' : ''}`}>🧾 Orders</button>
        <button onClick={() => setActiveTab('suppliers')} className={`tab ${activeTab === 'suppliers' ? 'active' : ''}`}>🏷️ Suppliers</button>
      </div>
          
      {activeTab === 'products' && (
        <>
          <input placeholder="Search by SKU..." value={searchSKU} onChange={e => setSearchSKU(e.target.value)} className="search-input" />
          <button onClick={() => setFormVisible(!formVisible)} className="btn toggle-form">
            {formVisible ? 'Hide Form' : '➕ Create Product'}
          </button>
          <button onClick={handleExport} className="btn export">⬇ Export Excel</button>        
             <label className="btn import">
               ⬆ Import Excel
               <input type="file" accept=".xlsx,.xls" onChange={handleImport} hidden />
               </label>   

          {formVisible && (
           <form onSubmit={handleProductSubmit} className="product-form">
  <h2 className="form-title">➕ Add New Product</h2>

  <input
    placeholder="Name"
    value={form.name}
    onChange={e => setForm({ ...form, name: e.target.value })}
    required
  />
  <input
    placeholder="SKU"
    value={form.sku}
    onChange={e => setForm({ ...form, sku: e.target.value })}
    required
  />
  <input
    placeholder="Image URL"
    value={form.image}
    onChange={e => setForm({ ...form, image: e.target.value })}
  />

  <label>Suppliers & Prices:</label>
  {form.suppliers.map((s, i) => (
    <div key={i} className="supplier-row">
      <select
        value={s.supplierId}
        onChange={e => handleSupplierChange(i, 'supplierId', e.target.value)}
        required
      >
        <option value="">Select Supplier</option>
        {suppliers.map(sup => (
          <option key={sup.id} value={sup.id}>{sup.name}</option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Price"
        value={s.price}
        onChange={e => handleSupplierChange(i, 'price', e.target.value)}
        required
        min="0"
      />

      {form.suppliers.length > 1 && (
        <button type="button" className="remove-supplier" onClick={() => {
          const updated = [...form.suppliers];
          updated.splice(i, 1);
          setForm({ ...form, suppliers: updated });
        }}>❌</button>
      )}
    </div>
  ))}

  <button type="button" className="btn add-supplier" onClick={handleAddSupplierField}>+ Add Supplier</button>

  <button type="submit" className="btn submit">✔ Create Product</button>
</form>

          )}

          <table className="product-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Suppliers</th>
                <th>QR</th>
                 <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><img src={p.image} alt={p.name} /></td>
                  <td><input value={p.name} onChange={e => handleEditProduct(p.id, { name: e.target.value })} /></td>
                  <td>{p.sku}</td>
                  <td>{p.suppliers.map(s => {
                    const found = suppliers.find(sup => sup.id === s.supplierId);
                    return <div key={s.supplierId}>{found ? found.name : 'Unknown'} - ${s.price}</div>;
                  })}</td>
                  <td><QRCodeCanvas value={p.sku} size={48} /></td>
                  <td>
  <span className={`order-status ${p.ordered ? 'active' : 'inactive'}`}>
    {p.ordered ? '❌ Ordered' : '✅ Not Ordered'}
  </span>
</td>

                  <td>
                    <button onClick={() => handleOrder(p.id)}>🚚</button>
                    <button onClick={() => handleDeleteProduct(p.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'suppliers' && (
        <div className="supplier-section">
  <form onSubmit={handleAddSupplier} className="supplier-form">
    <input
      placeholder="Supplier Name"
      value={supplierForm.name}
      onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
      required
    />
    <button type="submit" className="btn add-btn">➕ Add Supplier</button>
  </form>

  <ul className="supplier-list">
    {suppliers.map(s => (
      <li key={s.id} className="supplier-item">
        <input
          value={s.name}
          onChange={e => handleEditSupplier(s.id, e.target.value)}
          className="supplier-input"
        />
        <button
          onClick={() => handleDeleteSupplier(s.id)}
          className="btn delete-btn"
        >
          🗑 Delete
        </button>
      </li>
    ))}
  </ul>
</div>

      )}

      {activeTab === 'orders' && (
        <div className="orders-container">
          <button onClick={exportAllOrdersPDF} className="btn export">
  📄 Print All Orders PDF
</button>

  {Object.entries(groupedOrders).map(([sid, orders]) => (
    <div key={sid}>
      <h3>Supplier: {suppliers.find(s => s.id === sid)?.name || sid}</h3>
      <button className="btn export" onClick={exportOrdersToPDF}>
  📄 Export PDF
</button>

      <table>
        <thead>
          <tr><th>Image</th><th>Name</th><th>SKU</th><th>Qty</th>
            {/* <th>Price</th> */}
            <th>Remove</th></tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={i}>
              <td data-label="Image"><img src={o.image} alt={o.name} /></td>
              <td data-label="Name">{o.name}</td>
              <td data-label="SKU">{o.sku}</td>
              <td data-label="Qty">
                <input type="number" value={o.quantity} onChange={e => handleQuantityChange(o.id, e.target.value)} />
              </td>
              {/* <td data-label="Price">${o.price}</td> */}
              <td data-label="Remove">
                <button onClick={() => handleRemoveOrder(o.id)}>✖</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ))}
</div>

      )}
    </div>
  );
}


