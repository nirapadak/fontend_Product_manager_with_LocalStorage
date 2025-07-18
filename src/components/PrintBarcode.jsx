// import { useEffect, useRef } from "react";
// import JsBarcode from "jsbarcode";

// export default function PrintBarcode({ value, name }) {
//   const barcodeRef = useRef(null);
//   const printAreaRef = useRef(null);

//   useEffect(() => {
//     JsBarcode(barcodeRef.current, value, {
//       format: "CODE128",
//       lineColor: "#000",
//       width: 2,
//       height: 50,
//       displayValue: true,
//     });
//   }, [value]);

//   const handlePrint = () => {
//     const printContents = printAreaRef.current.innerHTML;
//     const win = window.open('', '', 'height=500,width=800');
//     win.document.write('<html><head><title>Print Barcode</title></head><body>');
//     win.document.write(printContents);
//     win.document.write('</body></html>');
//     win.document.close();
//     win.print();
//   };

//   return (
//     <div>
//       <div ref={printAreaRef}>
//         <svg ref={barcodeRef}></svg>
//         <p>{name}</p>
//       </div>
//       <button onClick={handlePrint} style={{ marginTop: '10px' }}>
//         Print Barcode
//       </button>
//     </div>
//   );
// }

// =====================================================================================================
// import { useEffect, useRef } from "react";
// import JsBarcode from "jsbarcode";

// export default function PrintBarcode({ value, name }) {
//   const barcodeRef = useRef(null);
//   const printAreaRef = useRef(null);

//   useEffect(() => {
//     JsBarcode(barcodeRef.current, value, {
//       format: "CODE128",
//       lineColor: "#000",
//       width: 2,
//       height: 30,  // Reduced height
//       displayValue: true,
//       fontSize: 20,  // Bigger text
//       fontOptions: "bold",  // Bold text
//       textMargin: 5,
//     });
//   }, [value]);

//   const handlePrint = () => {
//     const printContents = printAreaRef.current.innerHTML;
//     const win = window.open('', '', 'height=500,width=800');
//     win.document.write('<html><head><title>Print Barcode</title></head><body>');
//     win.document.write(printContents);
//     win.document.write('</body></html>');
//     win.document.close();
//     win.print();
//   };

//   return (
//     <div style={{ textAlign: "center" }}>
//       <div ref={printAreaRef} style={{ textAlign: "center" }}>
//         <svg ref={barcodeRef}></svg>
//         <p style={{ textAlign:'start', margin: "0px 0px 0px 50px", fontWeight: "bold", fontSize: "18px" }}>{name}</p>
//       </div>
//       <button onClick={handlePrint} style={{ marginTop: '10px' }}>
//         Print Barcode
//       </button>
//     </div>
//   );
// }


import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function PrintBarcode({ value, name }) {
  const barcodeRef = useRef(null);
  const printAreaRef = useRef(null);

  useEffect(() => {
    JsBarcode(barcodeRef.current, value, {
      format: "CODE128",
      lineColor: "#000",
      width: 1,
      height: 20,
      displayValue: false,
      margin: 0,
    });
  }, [value]);

  const handlePrint = () => {
    const printContents = printAreaRef.current.innerHTML;
    const win = window.open('', '', 'width=380,height=250');
    win.document.write(`
      <html>
        <head>
      
          <style>
            @page {
              size: 38mm 25mm;
              margin: 0;
            }
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .label {
              width: 38mm;
              height: 25mm;
              border: 1px solid #000;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
              box-sizing: border-box;
              text-align: center;
            }
            .id-text {
              font-weight: bold;
              font-size: 10px;
              margin: 1mm 0;
            }
            .barcode {
              margin: 1mm 0;
            }
            .name-text {
              font-size: 9px;
              margin: 1mm 0;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div ref={printAreaRef}>
        <div className="label">
          <div className="barcode">
            <svg ref={barcodeRef}></svg>
          </div>
          <div className="id-text">ID: {value}</div>
          <div className="name-text">{name}</div>
        </div>
      </div>
      <button onClick={handlePrint} style={{ marginTop: '10px' }}>
        Print Barcode
      </button>
    </div>
  );
}
