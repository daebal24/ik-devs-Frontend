"use client";

import React, { useState } from "react";
import { Document, Page as PdfPage, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface Props {
  pdfUrl: string;
  containerWidth: number;
  statusClass: string;
  statusErrorClass: string;
  pageClass: string;
}

export default function PdfRenderer({ pdfUrl, containerWidth, statusClass, statusErrorClass, pageClass }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  if (loadError) return <p className={statusErrorClass}>PDF 로드 오류: {loadError}</p>;

  return (
    <Document
      file={pdfUrl}
      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      onLoadError={(e) => setLoadError(e.message)}
      loading={<p className={statusClass}>PDF 로딩 중...</p>}
    >
      {Array.from({ length: numPages }, (_, i) => (
        <PdfPage
          key={i + 1}
          pageNumber={i + 1}
          width={containerWidth || undefined}
          className={pageClass}
        />
      ))}
    </Document>
  );
}
