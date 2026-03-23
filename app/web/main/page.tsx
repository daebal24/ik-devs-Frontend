"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import isLogin from "@/app/lib/login/islogin";
import { IsLoginApiData_data } from "@/types/api";

import styles from './page.module.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";

const CARDS = [
  {
    id: "card1",
    title: "소개",
    desc: "소개 및 안내",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    href: "/web/wpage/viewpage/introduction",
  },
  {
    id: "card2",
    title: "업무 요약",
    desc: "진행 중인 작업 현황 확인",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    href: "/web/tasksummary",
  },
  {
    id: "card4",
    title: "문서 목록",
    desc: "웹 사이트 문서 목록 관리",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
    href: "/web/wpage/managepage",
  },
  {
    id: "card3",
    title: "미디어 파일 목록",
    desc: "웹 사이트 미디어파일 관리",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    href: "/web/manageimage/viewimagelist",
  },
  {
    id: "card5",
    title: "테스트 낙서장",
    desc: "기능 테스트",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    href: "/web/wpage/viewpage/test",
  },
];

export default function Page() {
  const router = useRouter();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      const isLoginResult: IsLoginApiData_data = await isLogin();
      if (isLoginResult.haveSession == false) {
        toast.error("접근 권한이 없습니다.");
        setTimeout(() => {
          router.push("/web/login");
        }, 1000);
      }
    })();
  }, []);

  return (
    <main className={styles.mainWrapper}>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className={styles.gridContainer}>
        {CARDS.map((card) => (
          <div
            key={card.id}
            className={`${styles.card} ${styles[card.id]}`}
            onClick={() => router.push(card.href)}
          >
            <div className={styles.cardTop}>
              <div className={styles.cardTitle}>{card.title}</div>
              <div className={styles.cardDesc}>{card.desc}</div>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.cardArrow}>→</span>
              <div className={styles.cardIcon}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
