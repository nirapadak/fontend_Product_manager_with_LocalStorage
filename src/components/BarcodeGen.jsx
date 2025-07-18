import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function BarcodeGen({ value }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    JsBarcode(barcodeRef.current, value, {
      format: "CODE128",
      lineColor: "#000",
      width: 2,
      height: 50,
      displayValue: true,
    });
  }, [value]);

  return <svg ref={barcodeRef} />;
}
