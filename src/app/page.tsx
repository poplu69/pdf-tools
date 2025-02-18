'use client';

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import PdfCompressor from "../components/PdfCompressor";

export default function PDFManipulator() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("merge");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [splitFromPage, setSplitFromPage] = useState(1);
  const [splitToPage, setSplitToPage] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Merge PDFs functionality
  const mergePDFs = async () => {
    try {
      setLoading(true);
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const fileData = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileData);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }
      
      const mergedPdfFile = await mergedPdf.save();
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
      setResult(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Error merging PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Split PDFs functionality
  const splitPDF = async () => {
    try {
      setLoading(true);
      const file = files[0];
      const fileData = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileData);

      // Get all pages from the original document
      const pages = await pdf.getPages();

      // Validate the split inputs
      if (splitFromPage > pages.length || splitToPage > pages.length || splitFromPage > splitToPage) {
        alert("Invalid page range");
        return;
      }

      const splitFiles = [];
      
      // Create a new PDF for the split range
      const singlePagePdf = await PDFDocument.create();
      
      // Add pages to the new PDF from the specified range
      for (let i = splitFromPage - 1; i < splitToPage; i++) {
        const [copiedPage] = await singlePagePdf.copyPages(pdf, [i]);
        singlePagePdf.addPage(copiedPage);
      }

      const pdfBytes = await singlePagePdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      splitFiles.push(URL.createObjectURL(blob));

      // Display the split file
      setResult(splitFiles[0]);
    } catch (error) {
      console.error('Error splitting PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-6">
      {/* Card Container */}
      <div className="w-full bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800">PDF Tools</h2>
        <p className="text-gray-600">Powerful PDF manipulation tools for your needs</p>

        {/* Tabs Navigation */}
        <div className="mt-4 flex space-x-2 border-b">
          {["merge", "split", "compress", "convert", "watermark", "htmltopdf"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium capitalize transition-all ${
                activeTab === tab ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace(/([a-z])([A-Z])/g, "$1 $2")}
            </button>
          ))}
        </div>

        {/* Merge PDF Tab */}
        {activeTab === "merge" && (
          <div className="mt-6">
            {/* File Upload Box */}
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Drop PDFs here or click to upload</p>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="text-gray-700 font-medium">Selected Files:</h3>
                <ul className="list-disc pl-5 text-gray-600">
                  {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
                <button 
                  onClick={mergePDFs}
                  disabled={loading}
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition"
                >
                  {loading ? 'Merging...' : 'Merge PDFs'}
                </button>
              </div>
            )}

            {/* Download Merged PDF */}
            {result && (
              <div className="mt-4">
                <a
                  href={result}
                  download="merged.pdf"
                  className="text-blue-600 hover:underline"
                >
                  Download Merged PDF
                </a>
              </div>
            )}
          </div>
        )}

        {/* Split PDF Tab */}
        {activeTab === "split" && (
          <div className="mt-6">
            {/* File Upload Box */}
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Drop a PDF here or click to upload</p>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="text-gray-700 font-medium">Selected Files:</h3>
                <ul className="list-disc pl-5 text-gray-600">
                  {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
                <button 
                  onClick={() => setIsModalOpen(true)} // Open modal on button click
                  disabled={loading}
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition"
                >
                  {loading ? 'Splitting...' : 'Split PDF'}
                </button>
              </div>
            )}

            {/* Download Split PDF */}
            {result && (
              <div className="mt-4">
                <a
                  href={result}
                  download="split.pdf"
                  className="text-blue-600 hover:underline"
                >
                  Download Split PDF
                </a>
              </div>
            )}
          </div>
        )}

        {/* Modal for splitting */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-xl font-semibold">Split PDF</h3>

              <div className="mt-4">
                <label htmlFor="splitFromPage" className="block text-gray-700">From Page:</label>
                <input
                  type="number"
                  id="splitFromPage"
                  value={splitFromPage}
                  onChange={(e) => setSplitFromPage(Number(e.target.value))}
                  className="mt-2 p-2 border border-gray-300 rounded w-full"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="splitToPage" className="block text-gray-700">To Page:</label>
                <input
                  type="number"
                  id="splitToPage"
                  value={splitToPage}
                  onChange={(e) => setSplitToPage(Number(e.target.value))}
                  className="mt-2 p-2 border border-gray-300 rounded w-full"
                />
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { splitPDF(); setIsModalOpen(false); }}
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Split PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {activeTab !== "merge" && activeTab !== "split" && (
          <div className="mt-6 p-4 text-center text-gray-500">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} PDF functionality coming soon...
          </div>
        )}
      </div>
    </main>
  );
}
