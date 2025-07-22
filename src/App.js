
import React, { useEffect, useState, useRef } from 'react';

import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import './css/ProductDashboard.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Html5QrcodeScanner } from 'html5-qrcode';
import ProfileTab from './components/ProfileTab.jsx';
import PrintBarcode from './components/PrintBarcode.jsx';

const LOCAL_KEY_PRODUCTS = 'product_data';
const LOCAL_KEY_SUPPLIERS = 'supplier_data';

export default function App() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // Qr code downlaod poppup============================================

  const [qrPopupVisible, setQrPopupVisible] = useState(false);
  const [qrDownloadCount, setQrDownloadCount] = useState(1);
  const [selectedQrData, setSelectedQrData] = useState(null);


  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [profiles, setProfiles] = useState([]);



  const [selectedOrders, setSelectedOrders] = useState([]);


  const [supplierForm, setSupplierForm] = useState({
    name: '',
    shopName: '',
    contact: '',
    address: '',
    email: '',
    bankName: '',
    AccNo: '',
    id: ''
  });

  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [editSupplierForm, setEditSupplierForm] = useState({
    name: '',
    shopName: '',
    contact: '',
    address: '',
    email: '',
    bankName: '',
    AccNo: '',
    
  });


  const [form, setForm] = useState({ name: '', sku: '', image: '', unit: '', suppliers: [{ supplierId: '', price: '' }] });
  const [activeTab, setActiveTab] = useState('products');
  const [searchSKU, setSearchSKU] = useState('');

  const firstRenderRef = useRef(true);

  const [loading, setLoading] = useState(true);


  // useEffect(() => {
  //   const prod = localStorage.getItem(LOCAL_KEY_PRODUCTS);
  //   const supp = localStorage.getItem(LOCAL_KEY_SUPPLIERS);
  //   if (prod) setProducts(JSON.parse(prod));
  //   if (supp) setSuppliers(JSON.parse(supp));
  // }, []);

  useEffect(() => {
    setLoading(true);
    const prod = localStorage.getItem(LOCAL_KEY_PRODUCTS);
    const supp = localStorage.getItem(LOCAL_KEY_SUPPLIERS);

    if (prod) setProducts(JSON.parse(prod));
    if (supp) setSuppliers(JSON.parse(supp));

    setTimeout(() => setLoading(false), 500); // Small delay for effect
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
          email: supplierForm.email.trim(),
          bankName: supplierForm.bankName.trim(),
          AccNo: supplierForm.AccNo.trim(),
        }
      ]);
      setSupplierForm({ name: '', shopName: '', contact: '', address: '', email: '', bankName:'', AccNo: '', id: '' });
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

  // ✅ Load Profiles from Local Storage on Mount
  const getProfileData = () => {

    const storedProfiles = localStorage.getItem('profiles');
    if (storedProfiles) {
      setProfiles(JSON.parse(storedProfiles));
    }
  };




  const handleStartEditSupplier = (supplier) => {
    setEditingSupplierId(supplier.id);
    setEditSupplierForm({
      name: supplier.name,
      shopName: supplier.shopName,
      contact: supplier.contact,
      address: supplier.address,
      email: supplier.email,
      bankName: supplier.bankName,
      AccNo: supplier.AccNo
    });
  };

  const handleSaveEditedSupplier = () => {
    setSuppliers(suppliers.map(s => s.id === editingSupplierId ? { ...s, ...editSupplierForm } : s));
    setEditingSupplierId(null);
    setEditSupplierForm({ name: '', shopName: '', contact: '', address: '', email: '', bankName: '', AccNo: '' });
  };




  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const filtered = products.filter(p =>
    p.sku.toLowerCase().includes(searchSKU.toLowerCase()) ||
    p.name.toLowerCase().includes(searchSKU.toLowerCase())
  );
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
      id: p.id,
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

      const formattedProducts = importedData.map(item => {
        const suppliersList = (item.Suppliers || '').split(',').map(s => {
          const [supplierId, price] = s.split(':').map(x => x.trim());

          // Check if supplier exists
          const exists = suppliers.find(sup => sup.id === supplierId);

          // If not exist, add placeholder supplier
          if (!exists && supplierId) {
            setSuppliers(prev => [...prev, {
              id: supplierId,
              name: `Imported Supplier (${supplierId})`,
              shopName: '',
              contact: '',
              address: '',
              email: '',
              bankName: '',
              AccNo: '',
            }]);
          }

          return { supplierId, price };
        });

        return {
          id: uuidv4(),
          name: item.Name || '',
          sku: item.SKU || '',
          image: item.Image || '',
          unit: item.Unit || '',
          ordered: false,
          quantity: 1,
          suppliers: suppliersList
        };
      });

      setProducts(prev => [...prev, ...formattedProducts]);
    };

    reader.readAsArrayBuffer(file);
  };




  // export order PDF create button function ==============================================================


  const exportOrdersToPDF = async (buyer) => {
    const doc = new jsPDF();
    let isFirstPage = true;

    for (const [sid, orders] of Object.entries(groupedOrders)) {
      if (!isFirstPage) doc.addPage();
      isFirstPage = false;

      const supplier = suppliers.find(s => s.id === sid);
      const supplierName = supplier?.name || `Supplier ${sid}`;

      // --- Title ---
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`Order Invoice Record`, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      doc.setLineWidth(0.5);  // Optional: set line thickness
      doc.line(14, 19, doc.internal.pageSize.getWidth() - 14, 19);  

      // doc.text(`---------------------------------------------------------------------------`, doc.internal.pageSize.getWidth() / 2, 19, { align: 'center' });

      // --- Supplier Info (Left) ---
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Supplier: ${supplierName}`, 14, 26);
      if (supplier) {
        doc.text(`Contact: ${supplier.contact}`, 14, 30);
        doc.text(`Shop: ${supplier.shopName}`, 14, 34);



        const y = 38;
        const addressLines = doc.splitTextToSize(`Address: ${supplier.address}`, 80);
        doc.text(addressLines, 14, y);

        const nextY = y + (addressLines.length * 4);  // Move Y for next section
        doc.text(`Email: ${supplier.email}`, 14, nextY);




        // doc.text(`Address: ${supplier.address}`, 14, 44);
        // doc.text(`Email: ${supplier.email}`, 14, 50);
        doc.text(`BANK: ${supplier.bankName}`, 14, nextY+4)
        doc.text(`AC/NO: ${supplier.AccNo}`, 14, nextY+8)
        
    
        // doc.text(`PRODUCT DETAILS TABLE:`,  14, 68)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('PRODUCT DETAILS TABLE:', doc.internal.pageSize.getWidth() / 2, 72, { align: 'center' });
        doc.setFont('helvetica', 'normal');  // Reset to normal
        doc.setFontSize(10);

        

      }

      // --- Buyer Info (Right) ---
      if (buyer) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const rightX = pageWidth - 80;
        doc.text(`Buyer: ${buyer.name}`, rightX, 26);
        doc.text(`Company: ${buyer.company}`, rightX, 30);
        doc.text(`Contact: ${buyer.phone}`, rightX, 34);


        const y = 38;
        const addressLines = doc.splitTextToSize(`Address: ${buyer.address}`, 60);
        doc.text(addressLines, rightX, y);

        const nextY = y + (addressLines.length * 4);  // Move Y for next section
        doc.text(`Email: ${supplier.email}`, rightX, nextY);


        // doc.text(`Address: ${buyer.address}`, rightX, 44);
        // doc.text(`Email: ${buyer.email}`, rightX, 50);
      }

      // --- Product Table ---
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
            // unitPrice.toFixed(2),
            // total.toFixed(2)
          ];
        })
      );

      autoTable(doc, {
        startY: 74,
        head: [['SL', 'Image', 'Product Name', 'SKU', 'Unit', 'Qty', 'Unit Price', 'Total']],
        body: loadedRows,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 14 },
          2: { cellWidth: 70 },
          3: { cellWidth: 15 },
          4: { cellWidth: 15 },
          5: { cellWidth: 10 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 },
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

      const currentDate = new Date();

      const options = { day: '2-digit', month: 'long', year: 'numeric' };

      const formattedDate = currentDate.toLocaleDateString('en-GB', options);


      const finalY = doc.lastAutoTable.finalY || 60;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Date:`, 14, finalY + 10)
      // doc.text(`Date: ${formattedDate}`, 14, finalY + 10)
      // doc.text(`Total Quantity: ${totalQty}`, 14, finalY + 10);
      doc.text(`Total Quantity: ${totalQty}`, 14, finalY + 16);
      // doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 14, finalY + 16);
      doc.text(`Total Amount: `, 14, finalY + 22);
    }

    doc.save('invoice.pdf');

    // Reset ordered products after PDF generation
    // setProducts(prev =>
    //   prev.map(p => ({
    //     ...p,
    //     ordered: false,
    //     quantity: 1,
    //     orderedSupplierId: undefined,
    //     orderedPrice: undefined
    //   }))
    // );
  };


  //  all order delete button ======================================================

  const allOrderDeleteBtn = () => {

    // Reset ordered products after PDF generation
    setProducts(prev =>
      prev.map(p => ({
        ...p,
        ordered: false,
        quantity: 1,
        orderedSupplierId: undefined,
        orderedPrice: undefined
      }))
    );

    setShowDeleteOrdersConfirm(false)
  }







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

  // supplier delete confirm custom dialog function =========================================
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteOrdersConfirm, setShowDeleteOrdersConfirm] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setSuppliers(suppliers.filter(s => s.id !== supplierToDelete.id));
    setShowDeleteConfirm(false);
    setSupplierToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSupplierToDelete(null);
  };

  const cancelDeleteOrders = () => {
    setShowDeleteOrdersConfirm(false);
    setSelectedOrders(null);
    // setSupplierToDelete(null);
  };
  // supplier delete confirm custom dialog function ====================below=====================


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

  // const handleScanSuccess = (decodedText) => {
  //   setSearchSKU(decodedText);
  //   setScannerVisible(false);
  // };

  //  Bar code =scanner ================

  const handleScanSuccess = (decodedText) => {
    setSearchSKU(decodedText);
    setScannerVisible(false);
  };


  const scannerRef = useRef(null);

  const handleStartScanner = () => {
    if (scannerRef.current) return; // Prevent double init

    setScannerVisible(true);

    setTimeout(() => {
      scannerRef.current = new Html5QrcodeScanner(
        "Bar-reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          handleScanSuccess(decodedText);
          scannerRef.current.clear().then(() => {
            scannerRef.current = null;
          });
        },
        (errorMessage) => {
          // console.log(`Scan error: ${errorMessage}`);
        }
      );
    }, 100);
  };


  // const handleStartScanner = () => {
  //   setScannerVisible(true);
  //   setTimeout(() => {
  //     const scanner = new Html5QrcodeScanner(
  //       "Bar-reader",
  //       { fps: 10, qrbox: 250 },
  //       false
  //     );
  //     scanner.render(
  //       (decodedText) => {
  //         handleScanSuccess(decodedText);
  //         scanner.clear();
  //       },
  //       (errorMessage) => {
  //         // console.log(`Scan error: ${errorMessage}`);
  //       }
  //     );
  //   }, 100);
  // };

  //Qr code download ======================= number of ========================







  const generateQrPdf = (product, count) => {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const qrCanvas = qrRefs.current[product.sku];
    if (!qrCanvas) {
      alert('QR Code not found!');
      return;
    }

    const imgData = qrCanvas.toDataURL('image/png');

    const qrPerRow = 4;
    const qrPerColumn = 5;
    const totalPerPage = qrPerRow * qrPerColumn;

    const cellWidth = 50;
    const cellHeight = 50;

    const qrSize = 30;

    const startX = 10;
    const startY = 10;

    for (let i = 0; i < count; i++) {
      const pageIndex = Math.floor(i / totalPerPage);
      const positionInPage = i % totalPerPage;
      const row = Math.floor(positionInPage / qrPerRow);
      const col = positionInPage % qrPerRow;

      if (positionInPage === 0 && i !== 0) doc.addPage();

      const x = startX + col * cellWidth;
      const y = startY + row * cellHeight;

      // Centering within the cell
      const centerX = x + cellWidth / 2;
      const centerY = y + cellHeight / 2;

      // Draw Grid Box
      doc.setDrawColor(150);
      doc.rect(x, y, cellWidth, cellHeight);

      // Draw QR Code
      const qrX = centerX - qrSize / 2;
      const qrY = centerY - qrSize / 2 - 6; // move slightly up to fit text below
      doc.addImage(imgData, 'PNG', qrX, qrY, qrSize, qrSize);

      // SKU (small text)
      doc.setFontSize(6);
      doc.text(product.sku, centerX, qrY + qrSize + 4, { align: 'center' });

      // Product Name (larger text)
      doc.setFontSize(8);
      doc.text(product.name, centerX, qrY + qrSize + 9, { align: 'center' });
    }

    doc.save(`${product.sku}_QRCodes.pdf`);
  };


  // ============================================================================
  // supplier import and exprot =================================

  const [showSupplierForm, setShowSupplierForm] = useState(false);



  const handleExportSuppliers = () => {
    const dataToExport = suppliers.map(s => ({
      ID: s.id,
      Name: s.name,
      ShopName: s.shopName,
      Contact: s.contact,
      Address: s.address,
      Email: s.email
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');
    XLSX.writeFile(workbook, 'suppliers_backup.xlsx');
  };





  const handleImportSuppliers = (e) => {
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
        id: item.ID || uuidv4(),
        name: item.Name || '',
        shopName: item.ShopName || '',
        contact: item.Contact || '',
        address: item.Address || '',
        email: item.Email || ''
      }));

      setSuppliers(prev => [...prev, ...formatted]);
    };

    reader.readAsArrayBuffer(file);
  };

  // ============================================================================================


  // add pagination add function ====================================

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filtered.slice(indexOfFirstItem, indexOfLastItem);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchSKU]);





  return (
    <div className="app-container">

      <h1 className="dashboard-title">📦 Product Manager Dashboard</h1>

      <div className="tabs">
        <button onClick={() => setActiveTab('products')} className={`tab ${activeTab === 'products' ? 'active' : ''}`}>📋 Products</button>
        <button onClick={() => setActiveTab('orders')} className={`tab ${activeTab === 'orders' ? 'active' : ''}`}>🧾 Orders</button>
        <button onClick={() => setActiveTab('suppliers')} className={`tab ${activeTab === 'suppliers' ? 'active' : ''}`}>🏷️ Suppliers</button>

        <button onClick={() => setActiveTab('profiles')} className={`tab ${activeTab === 'profiles' ? 'active' : ''}`}>
          👤 Profiles
        </button>

      </div>

      {activeTab === 'products' && (
        <>
          <div className='ProductPageTopBar'>
          <input placeholder="Search by Name or SKU..." value={searchSKU} onChange={e => setSearchSKU(e.target.value)} className="search-input" />
          <button className="btn scan-btn" onClick={handleStartScanner}>📷 Scan QR</button>
          {scannerVisible && <div id="Bar-reader" style={{ width: '300px', margin: '10px auto' }}></div>}


          <button onClick={() => setFormVisible(!formVisible)} className="btn toggle-form">
            {formVisible ? 'Hide Form' : '➕ Create Product'}
          </button>
          <button onClick={handleExport} className="btn export">⬆ Export Excel</button>
          <label className="btn import">
            ⬇ Import Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} hidden />
          </label>


          </div>


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
                        onChange={e => handleSupplierChange(i, 'price', parseFloat(e.target.value) || 0)}
                        required
                        min="0"
                        step="0.01"
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
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="100%" style={{ textAlign: 'center', padding: '20px' }}>
                    🔄 Loading data...
                  </td>
                </tr>
              ) : (
                  
                
                  currentProducts.map((p, index) => {
                      
                                    

                    // const minPrice = Math.min(...supplierData.map(s => s.price));
                    const supplierData = p.suppliers.map(s => {
                      const found = suppliers.find(sup => sup.id === s.supplierId);
                      return {
                        name: found ? found.name : 'Unknown',
                        price: parseFloat(s.price)
                      };
                    })

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
                          {/* <QRCodeCanvas
                value={p.sku}
                size={48}
                ref={(el) => { if (el) qrRefs.current[p.sku] = el; }}

              /> */}
                          {/* <BarcodeGen value={p.sku}/> */}
                          <PrintBarcode value={p.sku} name={p.name} />

                          {/* <div style={{ fontSize: '12px' }} onClick={() => {
                              // downloadQRCode(p.sku)
                                 setSelectedQrData(p);   // p is product object
                                setQrDownloadCount(1);
                                  setQrPopupVisible(true);
                            }}> */}
                          {/* <p style={{ fontSize: '9px', padding: '0', margin:'0' }}>{`${p.sku}`}</p> */}
                          {/* <p style={{ fontSize: '12px', padding: '0', margin:'0' }}>{`${p.name}`}</p> */}
                          {/* </div> */}



                          {/* qr code download pupup ==================================================== */}
                          {qrPopupVisible && (
                            <div className="custom-popup-overlay">
                              <div className="custom-popup">
                                <h3>Download QR Codes</h3>
                                <p>SKU: {selectedQrData?.sku}</p>
                                <p>Name: {selectedQrData?.name}</p>

                                <input
                                  type="number"
                                  min="1"
                                  value={qrDownloadCount}
                                  onChange={(e) => setQrDownloadCount(Number(e.target.value))}
                                />

                                <div className="popup-buttons">
                                  <button onClick={() => {
                                    generateQrPdf(selectedQrData, qrDownloadCount);
                                    setQrPopupVisible(false);
                                  }}>Download</button>
                                  <button onClick={() => setQrPopupVisible(false)}>Cancel</button>
                                </div>
                              </div>
                            </div>
                          )}


                        </td>
                        <td>
                          <span className={`order-status ${p.ordered ? 'active' : 'inactive'}`}>
                            {p.ordered ? '❌ Ordered' : '✅ Not Ordered'}
                          </span>
                        </td>
                        <td>


                          <button
                            className="productUpdateBtn"
                            style={{ fontSize: '16px', padding: '5px 10px', marginLeft: '5px' }}
                            onClick={() => handleProductEditStart(p)}
                          >
                            ✏️ Update
                          </button>

                          <button
                            className="productDeleteBtn"
                            style={{ fontSize: '16px', padding: '5px 10px', marginLeft: '5px' }}
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this product?')) {
                                handleDeleteProduct(p.id);
                              }
                            }}
                          >
                            ❌
                          </button>


                        </td>

                        <td>
                          <button
                            className="productOrderBtn"
                            style={{ fontSize: '18px', padding: '6px 12px' }}
                            onClick={() => handleOrder(p.id)}
                          >
                            🚚 Order
                          </button>
                        </td>

                      </tr>
                    )
                  }
              

                
  //                   filtered.map((p, index) => {
  //                     // const supplierData = p.suppliers.map(s => {
  //                     //   const found = suppliers.find(sup => sup.id === s.supplierId);
  //                     //   return {
  //                     //     name: found ? found.name : 'Unknown',
  //                     //     price: s.price
  //                     //   };
  //                     // });

  //                     // const minPrice = Math.min(...supplierData.map(s => s.price));
  //                     const supplierData = p.suppliers.map(s => {
  //                       const found = suppliers.find(sup => sup.id === s.supplierId);
  //                       return {
  //                         name: found ? found.name : 'Unknown',
  //                         price: parseFloat(s.price)
  //                       };
  //                     });

  //                     if (supplierData.length === 0) return <span>No Supplier</span>;

  //                     const minSupplier = supplierData.reduce((min, curr) => curr.price < min.price ? curr : min);


  //                     return (
  //                       <tr key={p.id}>
  //                         <td><h4>{index + 1}</h4></td>
  //                         <td><img src={p.image} alt={p.name} style={{ width: '50px', height: '50px' }} /></td>
  //                         <td><input value={p.name} onChange={e => handleEditProduct(p.id, { name: e.target.value })} /></td>
  //                         <td>{p.sku}</td>
  //                         <td>

  //                           <table className="supplier-inner-table">
  //                             <tbody>
  //                               {(() => {
  //                                 const supplierData = p.suppliers.map(s => {
  //                                   const found = suppliers.find(sup => sup.id === s.supplierId);
  //                                   return {
  //                                     name: found ? found.name : 'Unknown',
  //                                     price: parseFloat(s.price)
  //                                   };
  //                                 });

  //                                 if (supplierData.length === 0) return <tr><td>No Supplier</td></tr>;

  //                                 const minPrice = Math.min(...supplierData.map(s => s.price));

  //                                 return supplierData.map((s, idx) => (
  //                                   <tr key={idx}>
  //                                     <td className='supplierTBno'>{idx + 1}</td>
  //                                     <td className='supplierTBname'>{s.name}</td>
  //                                     <td style={{
  //                                       backgroundColor: s.price === minPrice ? 'lightgreen' : 'transparent',
  //                                       fontWeight: s.price === minPrice ? 'bold' : 'normal',
  //                                       borderRadius: '4px',
  //                                       padding: '2px 6px'
  //                                     }}>
  //                                       {s.price}/-
  //                                     </td>
  //                                   </tr>
  //                                 ));
  //                               })()}
  //                             </tbody>
  //                           </table>
  //                         </td>



  //                         <td style={{ cursor: 'pointer' }}>
  //                           {/* <QRCodeCanvas
  //   value={p.sku}
  //   size={48}
  //   ref={(el) => { if (el) qrRefs.current[p.sku] = el; }}

  // /> */}
  //                           {/* <BarcodeGen value={p.sku}/> */}
  //                           <PrintBarcode value={p.sku} name={p.name} />

  //                           {/* <div style={{ fontSize: '12px' }} onClick={() => {
  //                 // downloadQRCode(p.sku)
  //                    setSelectedQrData(p);   // p is product object
  //                   setQrDownloadCount(1);
  //                     setQrPopupVisible(true);
  //               }}> */}
  //                           {/* <p style={{ fontSize: '9px', padding: '0', margin:'0' }}>{`${p.sku}`}</p> */}
  //                           {/* <p style={{ fontSize: '12px', padding: '0', margin:'0' }}>{`${p.name}`}</p> */}
  //                           {/* </div> */}



  //                           {/* qr code download pupup ==================================================== */}
  //                           {qrPopupVisible && (
  //                             <div className="custom-popup-overlay">
  //                               <div className="custom-popup">
  //                                 <h3>Download QR Codes</h3>
  //                                 <p>SKU: {selectedQrData?.sku}</p>
  //                                 <p>Name: {selectedQrData?.name}</p>

  //                                 <input
  //                                   type="number"
  //                                   min="1"
  //                                   value={qrDownloadCount}
  //                                   onChange={(e) => setQrDownloadCount(Number(e.target.value))}
  //                                 />

  //                                 <div className="popup-buttons">
  //                                   <button onClick={() => {
  //                                     generateQrPdf(selectedQrData, qrDownloadCount);
  //                                     setQrPopupVisible(false);
  //                                   }}>Download</button>
  //                                   <button onClick={() => setQrPopupVisible(false)}>Cancel</button>
  //                                 </div>
  //                               </div>
  //                             </div>
  //                           )}


  //                         </td>
  //                         <td>
  //                           <span className={`order-status ${p.ordered ? 'active' : 'inactive'}`}>
  //                             {p.ordered ? '❌ Ordered' : '✅ Not Ordered'}
  //                           </span>
  //                         </td>
  //                         <td>


  //                           <button
  //                             className="productUpdateBtn"
  //                             style={{ fontSize: '16px', padding: '5px 10px', marginLeft: '5px' }}
  //                             onClick={() => handleProductEditStart(p)}
  //                           >
  //                             ✏️ Update
  //                           </button>

  //                           <button
  //                             className="productDeleteBtn"
  //                             style={{ fontSize: '16px', padding: '5px 10px', marginLeft: '5px' }}
  //                             onClick={() => {
  //                               if (window.confirm('Are you sure you want to delete this product?')) {
  //                                 handleDeleteProduct(p.id);
  //                               }
  //                             }}
  //                           >
  //                             ❌
  //                           </button>


  //                         </td>

  //                         <td>
  //                           <button
  //                             className="productOrderBtn"
  //                             style={{ fontSize: '18px', padding: '6px 12px' }}
  //                             onClick={() => handleOrder(p.id)}
  //                           >
  //                             🚚 Order
  //                           </button>
  //                         </td>

  //                       </tr>
  //                     );
  //                   }
                    )
                
              )}
            </tbody>
          </table>

          
          {/* pagination add ===================================================== */}

          <div className="pagination-controls">
            <button
              className='btn'
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              ⬅ Prev
            </button>

            <span style={{ margin: '0 10px' }}>
              Page {currentPage} of {Math.ceil(filtered.length / itemsPerPage)}
            </span>

            <button
              className='btn'
              onClick={() => setCurrentPage(prev => (prev < Math.ceil(filtered.length / itemsPerPage) ? prev + 1 : prev))}
              disabled={currentPage === Math.ceil(filtered.length / itemsPerPage)}
            >
              Next ➡
            </button>
          </div>


        </>
      )}

      {activeTab === 'suppliers' && (
        <div className="supplier-section">
          <div className="supplier-actions">
            <button className="btn export" onClick={handleExportSuppliers}>⬆ Export Suppliers Excel</button>

            <label className="btn import">
              ⬇ Import Suppliers Excel
              <input type="file" accept=".xlsx,.xls" onChange={handleImportSuppliers} hidden />
            </label>
          </div>
          <input
            type="text"
            placeholder="Search by name or contact"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded"
          />




          <button className="btn toggle-form" onClick={() => setShowSupplierForm(!showSupplierForm)}>
            {showSupplierForm ? 'Hide Form' : '➕ Create Supplier'}
          </button>

          {showSupplierForm && (
            <div className="custom-popup-overlay">
              <div className="custom-popup">
                <h3>Create New Supplier</h3>

                <input placeholder="Supplier Name" value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
                <input placeholder="Shop Name" value={supplierForm.shopName} onChange={e => setSupplierForm({ ...supplierForm, shopName: e.target.value })}  />
                <input placeholder="Contact Number" value={supplierForm.contact} onChange={e => setSupplierForm({ ...supplierForm, contact: e.target.value })} required />
                <input placeholder="Address" value={supplierForm.address} onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} required />
                <input placeholder="Email" value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} />

                <input placeholder="Bank name" value={supplierForm.bankName} onChange={e => setSupplierForm({ ...supplierForm, bankName: e.target.value })} />

                <input placeholder="Account No" value={supplierForm.AccNo} onChange={e => setSupplierForm({ ...supplierForm, AccNo: e.target.value })}  />

                <div className="popup-buttons">
                  <button className="btn" onClick={(e) => { handleAddSupplier(e); setShowSupplierForm(false); }}>✔ Add Supplier</button>
                  <button className="btn delete-btn" onClick={() => setShowSupplierForm(false)}>✖ Cancel</button>
                </div>
              </div>
            </div>
          )}



          <div className="supplier-grid">

            {filteredSuppliers.map(s => (
              <div key={s.id} className="supplier-card">
                {editingSupplierId === s.id ? (
                  <>
                    <input value={editSupplierForm.name} onChange={e => setEditSupplierForm({ ...editSupplierForm, name: e.target.value })} />
                    <input value={editSupplierForm.shopName} onChange={e => setEditSupplierForm({ ...editSupplierForm, shopName: e.target.value })} />
                    <input value={editSupplierForm.contact} onChange={e => setEditSupplierForm({ ...editSupplierForm, contact: e.target.value })} />
                    <input value={editSupplierForm.address} onChange={e => setEditSupplierForm({ ...editSupplierForm, address: e.target.value })} />
                    <input value={editSupplierForm.email} onChange={e => setEditSupplierForm({ ...editSupplierForm, email: e.target.value })} />

                    <input value={editSupplierForm.bankName} onChange={e => setEditSupplierForm({ ...editSupplierForm, bankName: e.target.value })} />

                    <input value={editSupplierForm.AccNo} onChange={e => setEditSupplierForm({ ...editSupplierForm, AccNo: e.target.value })} />

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
                      <p><strong>BANK :</strong> {s.bankName}</p>
                      <p><strong>ACCOUNT NO:</strong> {s.AccNo}</p>
                      
                    <button onClick={() => handleStartEditSupplier(s)} className="btn edit-btn">✏ Edit</button>
                    {/* <button onClick={() => handleDeleteSupplier(s.id)} className="btn delete-btn">🗑 Delete</button> */}
                    <button onClick={() => handleDeleteClick(s)} className="btn delete-btn">Delete</button>

                  </>
                )}
              </div>
            ))}
          </div>

        </div>


      )}

      {showDeleteConfirm && (
        <div className="custom-popup-overlay">
          <div className="custom-popup">
            <p>Are you sure you want to delete <strong>Supplier -: {supplierToDelete?.name}</strong>?</p>
            <div className="mt-2 flex gap-2 justify-end">
              <button onClick={cancelDelete} className="btn edit-btn">Cancel</button>
              <button onClick={confirmDelete} className="btn delete-btn">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteOrdersConfirm && (
        <div className="custom-popup-overlay">
          <div className="custom-popup">
            <p>Are you sure you want to delete All Orders?</p>
            <div className="mt-2 flex gap-2 justify-end">
              <button onClick={cancelDeleteOrders} className="btn edit-btn">Cancel</button>
              <button onClick={allOrderDeleteBtn} className="btn delete-btn">Delete</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-container">
          {/* <button onClick={exportOrdersToPDF} className="btn export">
  📄 Print All Orders PDF
</button> */}
          <button onClick={() => {
            getProfileData()
            setShowPrintDialog(true)
          }} className="btn export">
            📄 Print All Orders PDF
          </button>
          <button className='btn delete-btn' onClick={() => {

            setShowDeleteOrdersConfirm(true)
          }}>
            All Order Delete
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


      {showPrintDialog && (
        <div className="custom-popup-overlay">
          <div className="custom-popup">
            <h3 className="text-lg font-bold mb-2">Select Buyer</h3>
            <select
              className="w-full border p-2 rounded mb-4"
              value={selectedBuyer?.id || ''}
              onChange={(e) => {
                const buyer = profiles.find(p => p.id === e.target.value);
                setSelectedBuyer(buyer);
              }}
            >
              <option value="">-- Select Buyer --</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.company})</option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPrintDialog(false)} className="btn delete-btn">Cancel</button>
              <button
                onClick={() => {
                  if (selectedBuyer) {
                    exportOrdersToPDF(selectedBuyer);
                    setShowPrintDialog(false);
                  } else {
                    alert('Please select a buyer');
                  }
                }}
                className="btn"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}



      <ProfileTab activeTab={activeTab} setActiveTab={setActiveTab} />



    </div>
  );
}


