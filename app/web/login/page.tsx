"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Page() {
  const router = useRouter();
  const didRun = useRef(false); // useEffect 중복 호출 방지
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const pwRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    // 현재 쿠키로 저장된 세션정보 보내서 로그아웃 처리
    async function autologout() {
      try {
        const res = await fetch("/api/commonapi", {
          method: "POST",
          credentials: "include", // 세션 쿠키 포함
          cache: "no-store",
          body: JSON.stringify({
            apiname: "deleteLoginSession",
          }),
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        console.log(res);
      } catch (e) {
        throw new Error(`Request failed: ${(e as Error).message}`);
      }
    }
    autologout();
  }, []);

  async function login(inputid: string, inputpw: string) {
    try {
      if (!inputid) return alert("아이디를 입력하세요.");
      if (!inputpw) return alert("비밀번호를 입력하세요.");

      const res = await fetch("/api/commonapi", {
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({
          apiname: "login",
          bodydata: { id: inputid, pw: inputpw },
        }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const text = await res.text();
      const json = JSON.parse(text);
      const loginresult = json.data;
      console.log(loginresult);

      switch (loginresult.result) 
      {
        case "ok":
          router.push("/web/main");
          break;
        case "fail":
          alert("아이디와 비밀번호가 일치하지 않습니다. 현재 로그인 시도횟수 카운트 : "+loginresult.LoginFailcount);
          break;
        case "locked":
          alert("로그인 실패횟수 초과입니다. 관리자에게 문의해주세요");
          break;
        case "otp_create":
          alert("OTP 키 생성");
          sessionStorage.setItem('loginresult', JSON.stringify(loginresult));
          router.push('/web/login/otpcreate');
          break;
        case "otp_verify":
          alert("OTP 인증요청");
          sessionStorage.setItem('loginresult', JSON.stringify(loginresult));
          router.push('/web/login/otplogin');
          break;
        default:
          alert("알 수 없는 에러입니다. 관리자에게 문의해주세요");
          break;
      }
    } 
    catch (error) {
      console.log(error);
      throw new Error(`Request failed: ${error}`);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <div className={styles.header}>
          <div className={styles.title}>
            RS<span className={styles.titleAccent}>Board</span>
          </div>
          <div className={styles.subtitle}>로그인하여 계속하세요</div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="input_id">아이디</label>
          <input
            className={styles.input}
            type="text"
            id="input_id"
            name="input_id"
            placeholder="아이디 입력"
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && pwRef.current?.focus()}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="input_pw">비밀번호</label>
          <input
            ref={pwRef}
            className={styles.input}
            type="password"
            id="input_pw"
            name="input_pw"
            placeholder="비밀번호 입력"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login(id, pw)}
          />
        </div>

        <button className={styles.btn} onClick={() => login(id, pw)}>
          로그인
        </button>

        <hr className={styles.divider} />

        <div className={styles.footer}>
          RSBoard v1.0 · Authorized access only
        </div>

      </div>
    </main>
  );
}
