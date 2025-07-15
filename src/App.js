
import React, { useEffect, useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import './css/ProductDashboard.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Html5QrcodeScanner } from 'html5-qrcode';

const LOCAL_KEY_PRODUCTS = 'product_data';
const LOCAL_KEY_SUPPLIERS = 'supplier_data';

export default function App() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [supplierForm, setSupplierForm] = useState({
  name: '',
  shopName: '',
  contact: '',
  address: '',
  email: '',
  id: ''
  });
  
  const [editingSupplierId, setEditingSupplierId] = useState(null);
const [editSupplierForm, setEditSupplierForm] = useState({
  name: '',
  shopName: '',
  contact: '',
  address: '',
  email: ''
});


  const [form, setForm] = useState({ name: '', sku: '', image: '', unit:'', suppliers: [{ supplierId: '', price: '' }] });
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

  // const handleProductSubmit = (e) => {
  //   e.preventDefault();
  //   const newProduct = { id: uuidv4(), ...form, ordered: false, quantity: 1 };
  //   setProducts(prev => [...prev, newProduct]);
  //   setForm({ name: '', sku: '', image: '', unit:'',suppliers: [{ supplierId: '', price: '' }] });
  //   setFormVisible(false);
  // };


  const handleProductSubmit = (e) => {
  e.preventDefault();

  if (editingProductId) {
    // Update existing product
    setProducts(products.map(p => p.id === editingProductId ? { ...p, ...form } : p));
    setEditingProductId(null);
  } else {
    // Create new product
    const newProduct = { id: uuidv4(), ...form, ordered: false, quantity: 1 };
    setProducts(prev => [...prev, newProduct]);
  }

  setForm({ name: '', sku: '', image: '', unit: '', suppliers: [{ supplierId: '', price: '' }] });
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
    // setActiveTab('orders');
  };

  const handleEditProduct = (id, updatedField) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedField } : p));
  };

  const handleAddSupplier = (e) => {
  e.preventDefault();
  if (supplierForm.name.trim()) {
    setSuppliers(prev => [
      ...prev,
      {
        id: uuidv4(),
        name: supplierForm.name.trim(),
        shopName: supplierForm.shopName.trim(),
        contact: supplierForm.contact.trim(),
        address: supplierForm.address.trim(),
        email: supplierForm.email.trim()
      }
    ]);
    setSupplierForm({ name: '', shopName: '', contact: '', address: '', email: '', id: '' });
  }
  };
  
  const handleProductEditStart = (product) => {
  setEditingProductId(product.id);
  setForm({
    name: product.name,
    sku: product.sku,
    image: product.image,
    unit: product.unit,
    suppliers: product.suppliers
  });
  setFormVisible(true);
};


  
  const handleProductUpdate = (id) => {
  const updatedName = prompt('Enter new product name:');
  if (updatedName) {
    handleEditProduct(id, { name: updatedName });
  }
};

  
  const handleStartEditSupplier = (supplier) => {
  setEditingSupplierId(supplier.id);
  setEditSupplierForm({
    name: supplier.name,
    shopName: supplier.shopName,
    contact: supplier.contact,
    address: supplier.address,
    email: supplier.email
  });
};

  const handleSaveEditedSupplier = () => {
  setSuppliers(suppliers.map(s => s.id === editingSupplierId ? { ...s, ...editSupplierForm } : s));
  setEditingSupplierId(null);
  setEditSupplierForm({ name: '', shopName: '', contact: '', address: '', email: '' });
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

  
 const exportOrdersToPDF = async () => {
  const doc = new jsPDF();

  let isFirstPage = true;

  for (const [sid, orders] of Object.entries(groupedOrders)) {
    if (!isFirstPage) doc.addPage();
    isFirstPage = false;

    const supplier = suppliers.find(s => s.id === sid);
    const supplierName = supplier?.name || `Supplier ${sid}`;

    // Title & Supplier Details
    doc.setFontSize(16);
    doc.text(`Order Invoice Record`, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Supplier: ${supplierName}`, 14, 22);
    if (supplier) {
      doc.text(`Contact: ${supplier.contact}`, 14, 28);
      doc.text(`Shop: ${supplier.shopName}`, 14, 34);
      doc.text(`Address: ${supplier.address}`, 14, 40);
      doc.text(`Email: ${supplier.email}`, 14, 46);
    }

    let totalQty = 0;
    let totalAmount = 0;

    const loadedRows = await Promise.all(
      orders.map(async (o, index) => {
        const imgBase64 = await loadImageBase64(o.image);
        const qty = Number(o.quantity);
        const unitPrice = Number(o.price);
        const total = qty * unitPrice;
        totalQty += qty;
        totalAmount += total;
        return [
          index + 1,
          { image: imgBase64 },
          o.name,
          o.sku,
          o.unit,
          qty,
          ``,
          ``
        ];
      })
    );

    autoTable(doc, {
      startY: 52,
      head: [['SL', 'Image', 'Product Name', 'SKU', 'Unit', 'Qty', 'Unit Price', 'Total']],
      body: loadedRows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 10 },  // SL
        1: { cellWidth: 14 },  // Image
        2: { cellWidth: 40 },  // Product Name
        3: { cellWidth: 30 },  // SKU
        4: { cellWidth: 30 },  // Unit
        5: { cellWidth: 10 },  // Qty
        6: { cellWidth: 20 },  // Unit Price
        7: { cellWidth: 20 },  // Total
      },
      didDrawCell: (data) => {
        if (data.column.index === 1 && data.cell.section === 'body') {
          const imageObj = data.cell.raw;
          if (imageObj && imageObj.image) {
            doc.addImage(
              imageObj.image,
              'JPEG',
             data.cell.x,
          data.cell.y,
          data.cell.width,
          data.cell.height
            );
          }
        }
      }
    });

    const finalY = doc.lastAutoTable.finalY || 60;
    doc.setFontSize(10);
    doc.text(`Total Quantity: ${totalQty}`, 14, finalY + 10);
    doc.text("Total Price:", 14, finalY + 16);
    // doc.text('', 14, finalY + 16);
    // doc.text(`Total Price: $${totalAmount.toFixed(2)}`, 14, finalY + 16);
  }

  doc.save('invoice.pdf');
};

// Helper function
const loadImageBase64 = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve('');
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => resolve('');
    img.src = url;
  });
};

  
  


  // min product in supplier min proudct table ===================================

  //  qr code download =============================================================

  const qrRefs = useRef({}); // Object to store refs for each product

  const downloadQRCode = (sku) => {
    const canvas = qrRefs.current[sku];
    if (!canvas) {
      alert('QR Code not found!');
      return;
    }
    const pngUrl = canvas.toDataURL('image/png/jpg');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `${sku}_QRCode.jpg`;
    link.click();
  };



  //  product search by Qr code scan ===================================================
  


const [scannerVisible, setScannerVisible] = useState(false);

const handleScanSuccess = (decodedText) => {
  setSearchSKU(decodedText);
  setScannerVisible(false);
};

const handleStartScanner = () => {
  setScannerVisible(true);
  setTimeout(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );
    scanner.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
        scanner.clear();
      },
      (errorMessage) => {
        // console.log(`Scan error: ${errorMessage}`);
      }
    );
  }, 100);
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
          <button className="btn scan-btn" onClick={handleStartScanner}>📷 Scan QR</button>
{scannerVisible && <div id="qr-reader" style={{ width: '300px', margin: '10px auto' }}></div>}

           
          <button onClick={() => setFormVisible(!formVisible)} className="btn toggle-form">
            {formVisible ? 'Hide Form' : '➕ Create Product'}
          </button>
          <button onClick={handleExport} className="btn export">⬇ Export Excel</button>        
             <label className="btn import">
               ⬆ Import Excel
               <input type="file" accept=".xlsx,.xls" onChange={handleImport} hidden />
          </label>  
          




{formVisible && (
  <div className="dialog-overlay" onClick={() => { setFormVisible(false); setEditingProductId(null); }}>
    <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
      <button className="dialog-close-btn" onClick={() => { setFormVisible(false); setEditingProductId(null); }}>✖</button>
      <form onSubmit={handleProductSubmit} className="product-form">
        <h2 className="form-title">{editingProductId ? '✏️ Update Product' : '➕ Add New Product'}</h2>

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
        <input
          placeholder="Unit of Product"
          value={form.unit}
          onChange={e => setForm({ ...form, unit: e.target.value })}
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
        <button type="submit" className="btn submit">{editingProductId ? '✔ Update Product' : '✔ Create Product'}</button>
      </form>
    </div>
  </div>
)}



          

          {/* {formVisible && (
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
               <input
    placeholder="Unit of Product"
    value={form.unit}
    onChange={e => setForm({ ...form, unit: e.target.value })}
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

           
              <button type="submit" className="btn submit">
  {editingProductId ? '✔ Update Product' : '✔ Create Product'}
</button>


</form>

          )} */}

          

           <table className="product-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Image</th>
          <th>Name</th>
                <th>SKU</th>
          <th>Suppliers</th>
          <th>QR</th>
          <th>Status</th>
          <th>Actions</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((p, index) => {
          // const supplierData = p.suppliers.map(s => {
          //   const found = suppliers.find(sup => sup.id === s.supplierId);
          //   return {
          //     name: found ? found.name : 'Unknown',
          //     price: s.price
          //   };
          // });

          // const minPrice = Math.min(...supplierData.map(s => s.price));
             const supplierData = p.suppliers.map(s => {
      const found = suppliers.find(sup => sup.id === s.supplierId);
      return {
        name: found ? found.name : 'Unknown',
        price: parseFloat(s.price)
      };
    });

    if (supplierData.length === 0) return <span>No Supplier</span>;

    const minSupplier = supplierData.reduce((min, curr) => curr.price < min.price ? curr : min);


          return (
            <tr key={p.id}>
              <td><h4>{index + 1}</h4></td>
              <td><img src={p.image} alt={p.name} style={{ width: '50px', height: '50px' }} /></td>
              <td><input value={p.name} onChange={e => handleEditProduct(p.id, { name: e.target.value })} /></td>
              <td>{p.sku}</td>
              <td>
               
  <table className="supplier-inner-table">
    <tbody>
      {(() => {
        const supplierData = p.suppliers.map(s => {
          const found = suppliers.find(sup => sup.id === s.supplierId);
          return {
            name: found ? found.name : 'Unknown',
            price: parseFloat(s.price)
          };
        });

        if (supplierData.length === 0) return <tr><td>No Supplier</td></tr>;

        const minPrice = Math.min(...supplierData.map(s => s.price));

        return supplierData.map((s, idx) => (
          <tr key={idx}>
            <td className='supplierTBno'>{idx + 1}</td>
            <td className='supplierTBname'>{s.name}</td>
            <td style={{
              backgroundColor: s.price === minPrice ? 'lightgreen' : 'transparent',
              fontWeight: s.price === minPrice ? 'bold' : 'normal',
              borderRadius: '4px',
              padding: '2px 6px'
            }}>
              {s.price}/-
            </td>
          </tr>
        ));
      })()}
    </tbody>
  </table>
</td>

              
            
              <td style={{ cursor: 'pointer' }}>
  <QRCodeCanvas
    value={p.sku}
    size={48}
    ref={(el) => { if (el) qrRefs.current[p.sku] = el; }}
  />
  <div style={{ fontSize: '12px' }} onClick={() => downloadQRCode(p.sku)}>
    Click to Download
  </div>
</td>
              <td>
                <span className={`order-status ${p.ordered ? 'active' : 'inactive'}`}>
                  {p.ordered ? '❌ Ordered' : '✅ Not Ordered'}
                </span>
              </td>
              {/* <td>
                <button className='productOrderBtn' onClick={() => handleOrder(p.id)}>🚚</button>
                <button className='productDeleteBtn' onClick={() => handleDeleteProduct(p.id)}>🗑</button>
              </td> */}
              <td>
  <button
    className="productOrderBtn"
    style={{ fontSize: '18px', padding: '6px 12px' }}
    onClick={() => handleOrder(p.id)}
  >
    🚚 Order
  </button>

  <button
    className="productUpdateBtn"
    style={{ fontSize: '16px', padding: '5px 10px', marginLeft: '5px' }}
    onClick={() => handleProductEditStart(p)}
  >
    ✏️ Update
  </button>

  
              </td>
              <td>
                <button
    className="productDeleteBtn"
    style={{ fontSize: '16px', padding: '5px 10px', marginLeft: '5px' }}
    onClick={() => {
      if (window.confirm('Are you sure you want to delete this product?')) {
        handleDeleteProduct(p.id);
      }
    }}
  >
    🗑
  </button>
              </td>

            </tr>
          );
        })}
      </tbody>
    </table>
        </>
      )}

      {activeTab === 'suppliers' && (
       <div className="supplier-section">
  <form onSubmit={handleAddSupplier} className="supplier-form">
    <input placeholder="Supplier Name" value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
    <input placeholder="Shop Name" value={supplierForm.shopName} onChange={e => setSupplierForm({ ...supplierForm, shopName: e.target.value })} required />
    <input placeholder="Contact Number" value={supplierForm.contact} onChange={e => setSupplierForm({ ...supplierForm, contact: e.target.value })} required />
    <input placeholder="Address" value={supplierForm.address} onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} required />
    <input placeholder="Email" value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} required />
    <button type="submit" className="btn add-btn">➕ Add Supplier</button>
  </form>

  <div className="supplier-grid">
  {suppliers.map(s => (
    <div key={s.id} className="supplier-card">
      {editingSupplierId === s.id ? (
        <>
          <input value={editSupplierForm.name} onChange={e => setEditSupplierForm({ ...editSupplierForm, name: e.target.value })} />
          <input value={editSupplierForm.shopName} onChange={e => setEditSupplierForm({ ...editSupplierForm, shopName: e.target.value })} />
          <input value={editSupplierForm.contact} onChange={e => setEditSupplierForm({ ...editSupplierForm, contact: e.target.value })} />
          <input value={editSupplierForm.address} onChange={e => setEditSupplierForm({ ...editSupplierForm, address: e.target.value })} />
          <input value={editSupplierForm.email} onChange={e => setEditSupplierForm({ ...editSupplierForm, email: e.target.value })} />
          <button onClick={handleSaveEditedSupplier} className="btn save-btn">✔ Save</button>
          <button onClick={() => setEditingSupplierId(null)} className="btn cancel-btn">✖ Cancel</button>
        </>
      ) : (
        <>
          <h3>{s.name}</h3>
          <p><strong>Shop:</strong> {s.shopName}</p>
          <p><strong>Contact:</strong> {s.contact}</p>
          <p><strong>Address:</strong> {s.address}</p>
          <p><strong>Email:</strong> {s.email}</p>
          <button onClick={() => handleStartEditSupplier(s)} className="btn edit-btn">✏ Edit</button>
          <button onClick={() => handleDeleteSupplier(s.id)} className="btn delete-btn">🗑 Delete</button>
        </>
      )}
    </div>
  ))}
</div>

</div>


      )}

      {activeTab === 'orders' && (
        <div className="orders-container">
          <button onClick={exportOrdersToPDF} className="btn export">
  📄 Print All Orders PDF
</button>

  {Object.entries(groupedOrders).map(([sid, orders]) => (
    <div key={sid}>
      <h3>Supplier: {suppliers.find(s => s.id === sid)?.name || sid}</h3>

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


