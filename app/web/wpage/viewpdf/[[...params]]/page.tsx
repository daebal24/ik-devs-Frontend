"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { IsLoginApiData_data } from "@/types/api";
import isLogin from "@/app/lib/login/islogin";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";

const PdfRenderer = dynamic(() => import("./PdfRenderer"), { ssr: false });

type ViewMediaData = {
  name: string;
  memo: string;
  filename: string;
  filetype: string;
};

export default function Page() {
  const [pdfUrl, setPdfUrl] = useState("");
  const [pagememo, setPagememo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const didRun = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const inputparameter = useParams<{ params?: string[] }>();
  const params = inputparameter.params;
  const params_result = params
    ? Array.isArray(params)
      ? params.join("/")
      : params
    : "(파라미터 없음)";

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [pdfUrl]);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      const isLoginResult: IsLoginApiData_data = await isLogin();
      if (!isLoginResult.haveSession) {
        toast.error("접근 권한이 없습니다.");
        setTimeout(() => router.push("/web/login"), 1000);
        return;
      }
    })();

    (async () => {
      try {
        setError(null);

        const res = await fetch("/api/commonapi", {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            apiname: "viewMediaData",
            bodydata: { name: params_result },
          }),
        });

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const json = await res.json();
        const data = json.data as ViewMediaData[];

        const item = data.find((d: ViewMediaData) => d.name === params_result);
        if (!item) {
          setError("해당 이름의 미디어 데이터가 없습니다.");
          return;
        }
        setPdfUrl(`${process.env.NEXT_PUBLIC_MEDIA}/${item.filename}`);
        setPagememo(item.memo);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className={styles.container}>
      <ToastContainer position="top-center" autoClose={3000} />

      <div className={styles.header}>
        {/* <h2 className={styles.title}>{pagememo || "PDF 문서"}</h2> */}
        <h2 className={styles.title}>
          <a href={pdfUrl} target='_blank' download>PDF 다운로드</a>
        </h2>
      </div>

      <div className={styles.viewerWrapper} ref={containerRef}>
        {loading && <p className={styles.status}>불러오는 중...</p>}
        {error && <p className={styles.statusError}>오류: {error}</p>}
        {!loading && !error && pdfUrl && (
          <PdfRenderer
            pdfUrl={pdfUrl}
            containerWidth={containerWidth}
            statusClass={styles.status}
            statusErrorClass={styles.statusError}
            pageClass={styles.pdfPage}
          />
        )}
        {!loading && !error && !pdfUrl && (
          <p className={styles.status}>등록된 PDF 문서가 없습니다.</p>
        )}
      </div>
    </main>
  );
}
