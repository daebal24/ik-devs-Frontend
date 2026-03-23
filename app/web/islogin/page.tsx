//로그인 여부 체크하는 테스트코드

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import isLogin from "@/app/lib/login/islogin";
import { IsLoginApiData_data } from "@/types/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";

export default function SessionCheckPage() {
  const [result, setResult] = useState<any>(null);
  const router = useRouter();//react 하이퍼링크
  const didRun = useRef(false);//useEffect 중복 호출방지
  
  useEffect(() => {
    //useEffect 중복 호출방지
    if (didRun.current) return;
    didRun.current = true;

    //현재 브라우저가 로그인된 상태인지 확인. 없으면 로그인 제한
    (async () => {
      const isLoginResult:IsLoginApiData_data = await isLogin();
      if(isLoginResult.haveSession == false)
      {
        toast.error("접근 권한이 없습니다.");
        setTimeout(() => 
        {
          router.push("/web/login");
        }, 1000);
      }
    })();

  }, []);

  async function checkSession() {
    try {
      const res = await fetch("/api/commonapi", {
        method: "POST",
        credentials: "include", // 중요 (세션 쿠키 포함)
        body: JSON.stringify({
            apiname: "getsession",
          }),
      });

      if (!res.ok) {
        throw new Error(`status: ${res.status}`);
      }

      const data = await res.json();

      //console.log("세션 응답:", data);
      //console.log("document.cookie:", document.cookie);

      setResult(data);
    } catch (err) {
      console.error("에러:", err);
    }
  }

  return (
    <main>
      <ToastContainer position="top-center" autoClose={3000} />
      <h1>세션 확인 테스트</h1>
      <button onClick={checkSession}>세션 수동 확인버튼</button>

      <div style={{ marginTop: "20px" }}>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    </main>
  );
}
