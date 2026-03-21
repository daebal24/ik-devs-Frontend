"use client"; 
{/* <button className={styles.topBtn} onClick={() => { if (!isAdmin) { toast.error("허용되지 않는 사용자입니다."); return; } router.push("/web/manageimage/uploadimage"); }}>파일 업로드</button> */}

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import isLogin from "@/app/lib/login/islogin";
import { IsLoginApiData_data } from "@/types/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";

// 🔹 Header 컴포넌트
export default function Header() {
    const [isLoginornot, setIsLogin] = useState(false);
    const router = useRouter();

    const didRun = useRef(false);
    useEffect(() => {
      //현재 브라우저가 로그인된 상태인지 확인. 없으면 로그인 제한
      
      //StrictMode로 effect가 두 번 타도 첫 번째만 처리하게 막기
      if (didRun.current) return;
      didRun.current = true;

      (async () => {
        const isLoginResult:IsLoginApiData_data = await isLogin();
        if(isLoginResult.haveSession == false)
        {
            toast.error("접근 권한이 없습니다.");
            setTimeout(() => {
                router.push("/web/login");
              }, 1000);
            return;
        }
        setIsLogin(true);
      })();

    });
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
        <button onClick={() => 
          { 
          if (!isLoginornot) { toast.error("로그인 후 접근가능합니다."); return; } 
          router.push("/web/wpage/viewpage/introduction"); 
          }}>
          소개/introduction
        </button>
        <button onClick={() => 
          { 
          if (!isLoginornot) { toast.error("로그인 후 접근가능합니다."); return; } 
          router.push("/web/tasksummary"); 
          }}>
          업무요약
        </button>
        <button onClick={() => 
          { 
          if (!isLoginornot) { toast.error("로그인 후 접근가능합니다."); return; } 
          router.push("/web/wpage/managepage"); 
          }}>
          문서목록
        </button>
        <button onClick={() => 
          { 
          if (!isLoginornot) { toast.error("로그인 후 접근가능합니다."); return; } 
          router.push("/web/manageimage/viewimagelist"); 
          }}>
          미디어 파일
        </button>
        <button onClick={() => 
          { 
            router.push("/web/login"); 
          }}>
          로그아웃
        </button>
        
        <a href="/web/main"  style={{ margin: 0, fontSize: "1.25rem", textDecoration: "none", color:"white"}}>ik-dev</a>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <a 
            href="/web/wpage/viewpage/introduction" 
            style={{
              color: "rgba(255,255,255,0.9)",
              textDecoration: "none",
              fontSize: "0.875rem",
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              transition: "background 0.2s",
            }}
            >
              소개/introduction
          </a>
          <a 
            href="/web/tasksummary" 
            style={{
              color: "rgba(255,255,255,0.9)",
              textDecoration: "none",
              fontSize: "0.875rem",
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              transition: "background 0.2s",
            }}
            >
              업무요약
          </a>
          <a 
            href="/web/wpage/managepage" 
            style={{
              color: "rgba(255,255,255,0.9)",
              textDecoration: "none",
              fontSize: "0.875rem",
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              transition: "background 0.2s",
            }}
            >
              문서목록
          </a>
          <a 
            href="/web/manageimage/viewimagelist" 
            style={{
              color: "rgba(255,255,255,0.9)",
              textDecoration: "none",
              fontSize: "0.875rem",
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              transition: "background 0.2s",
            }}
            >
              미디어 파일
          </a>
          <a 
            href="/web/login" 
            style={{
              color: "rgba(255,255,255,0.9)",
              textDecoration: "none",
              fontSize: "0.875rem",
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              transition: "background 0.2s",
            }}
          >
          로그아웃</a>
        </nav>
        <ToastContainer position="top-center" autoClose={3000} />
      </header>
    );
  }


  