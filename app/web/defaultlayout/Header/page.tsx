"use client";

import React, { useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import styles from "./page.module.css";

const HIDE_HEADER_PATHS = ["/web/login"];

const NAV_ITEMS = [
  { label: "소개",              path: "/web/wpage/viewpage/introduction" },
  { label: "업무요약",          path: "/web/tasksummary" },
  { label: "문서목록 / AICHAT", path: "/web/wpage/managepage" },
  { label: "미디어 파일",       path: "/web/manageimage/viewimagelist" },
  { label: "로그아웃",          path: "/web/login" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRouterPush = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  if (HIDE_HEADER_PATHS.includes(pathname)) return <header />;

  return (
    <header className={styles.header}>
      <a href="/web/main" className={styles.logo}>
        ik-dev
      </a>

      {/* 데스크탑 nav */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            className={styles.navBtn}
            onClick={() => handleRouterPush(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* 햄버거 버튼 (모바일) */}
      <button
        className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="메뉴 열기"
        aria-expanded={menuOpen}
      >
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
      </button>

      {/* 모바일 드롭다운 */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            className={styles.mobileNavBtn}
            onClick={() => handleRouterPush(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </header>
  );
}
