"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter, usePathname  } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";


const HIDE_HEADER_PATHS = [
  "/web/login",
];

const navBtnStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.9)",
  textDecoration: "none",
  fontSize: "0.875rem",
  padding: "6px 14px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.3)",
  background: "rgba(255,255,255,0.1)",
  transition: "background 0.2s",
  cursor: "pointer",
  fontFamily: "inherit",
};

export default function Header() {
  const router = useRouter();
  const didRun = useRef(false);

  const pathname = usePathname();
 
  
  //로그인창에선 헤더 비활성
  if (HIDE_HEADER_PATHS.includes(pathname)) return (<header></header>);

  return (
    <header
      style={{
        background: "linear-gradient(to bottom, rgba(30,40,120,0.65), rgba(30,40,120,0))",
        color: "white",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <a
        href="/web/main"
        style={{ margin: 0, fontSize: "1.25rem", textDecoration: "none", color: "white" }}
      >
        ik-dev
      </a>

      <nav style={{ display: "flex", gap: "1rem" }}>
        <button style={navBtnStyle} onClick={() => router.push("/web/wpage/viewpage/introduction")}>
          소개/introduction
        </button>
        <button style={navBtnStyle} onClick={() => router.push("/web/tasksummary")}>
          업무요약
        </button>
        <button style={navBtnStyle} onClick={() => router.push("/web/wpage/managepage")}>
          문서목록 / AICHAT
        </button>
        <button style={navBtnStyle} onClick={() => router.push("/web/manageimage/viewimagelist")}>
          미디어 파일
        </button>
        <button style={navBtnStyle} onClick={() => router.push("/web/login")}>
          로그아웃
        </button>
      </nav>

      <ToastContainer position="top-center" autoClose={3000} />
    </header>
  );
}
