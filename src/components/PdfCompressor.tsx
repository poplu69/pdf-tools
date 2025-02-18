"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

const PdfCompressor = () => {
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressedPdf, setCompressedPdf] = useState<Blob | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const fileSizeKB = (file.size / 1024).toFixed(2);
      setOriginalSize(parseFloat(fileSizeKB));

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Optimize PDF (Basic Compression)
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: false, // Reduces size
      });

      const compressedFileSizeKB = (compressedBytes.length / 1024).toFixed(2);
      setCompressedSize(parseFloat(compressedFileSizeKB));

      // Store compressed PDF as Blob
      setCompressedPdf(new Blob([compressedBytes], { type: "application/pdf" }));
    }
  };

  const handleDownload = () => {
    if (compressedPdf) {
      saveAs(compressedPdf, "compressed.pdf");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md w-96 mx-auto mt-10">
      <h2 className="text-lg font-semibold mb-3">PDF Compressor</h2>
      <input type="file" accept="application/pdf" onChange={handleFileUpload} className="mb-3" />

      {originalSize !== null && compressedSize !== null && (
        <div className="mt-3">
          <p>📂 Original Size: <b>{originalSize} KB</b></p>
          <p>📉 Compressed Size: <b>{compressedSize} KB</b></p>
        </div>
      )}

      {compressedPdf && (
        <button
          onClick={handleDownload}
          className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Download Compressed PDF
        </button>
      )}
    </div>
  );
};

export default PdfCompressor;
