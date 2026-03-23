"use client";

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";


type LoginResult = {
  id: string;
  usertype: string;
  result: string;
};

export default function OtpSetup() {
  const router = useRouter();
  const [loginresult, setloginresult] = useState<LoginResult | null>(null);
  const [otpcode, setcode] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem('loginresult');

    if (!raw) {
      // 데이터 없으면 홈으로 튕겨냄
      toast.error("ERROR");
      setTimeout(() => {
          router.push("/");
        }, 1000);  
      return;
    }

    setloginresult(JSON.parse(raw));
    console.log(raw);
    console.log(JSON.parse(raw));
    console.log(loginresult);
    sessionStorage.removeItem('otpData');  // 읽자마자 삭제
  }, []);

  if (!loginresult) return <p>Loading...</p>;

  //테스트값

  
  async function otplogin() {
    try {
      if (!otpcode) return toast.warn("코드를 입력하세요.");
      if (!loginresult) return;  // 비정상적 접근 차단

      const id = loginresult.id;
      const usertype = loginresult.usertype;

      //loginresult에 id, usertype 실어서 보냄
      const res = await fetch("/api/commonapi", {
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({
          apiname: "GoogleOTPLogin",
          bodydata: { id: id, usertype: usertype, otpcode: otpcode },
        }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const text = await res.text();
      const json = JSON.parse(text);
      const result_GoogleOTPLogin = json.data;
      console.log(result_GoogleOTPLogin);

      switch (result_GoogleOTPLogin.result) 
      {
        case "ok":
          router.push("/web/wpage/viewpage/introduction");
          //router.push("/web/main");
          break;
        case "fail":
          toast.error("아이디와 비밀번호가 일치하지 않습니다. 현재 로그인 시도횟수 카운트 : "+result_GoogleOTPLogin.LoginFailcount);
          break;
        case "locked":
          toast.error("로그인 실패횟수 초과입니다. 관리자에게 문의해주세요");
          break;
        default:
          toast.error("알 수 없는 에러입니다. 관리자에게 문의해주세요");
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
      <ToastContainer position="top-center" autoClose={3000} />
      <div className={styles.card}>

        <div className={styles.header}>
          <div className={styles.title}>
            RS<span className={styles.titleAccent}>Board</span>
          </div>
          <div className={styles.subtitle}>구글 OTP코드를 입력하여 로그인해주세요</div>
          <div className={styles.subtitle}>(Google Authenticator 앱)</div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="input_pw">OTP코드</label>
          <input
            className={styles.input}
            type="text"
            id="input_pw"
            name="input_pw"
            placeholder="OTP코드 입력"
            value={otpcode}
            onChange={(e) => setcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && otplogin()}
          />
        </div>
        <div className={styles.centeralign}>
          <button className={styles.btn} onClick={() => otplogin()}>
          로그인
          </button>
          <button className={styles.btn_back} onClick={() => router.push("/")}>
            뒤로가기
          </button>
        </div>
        

        <hr className={styles.divider} />

      </div>
    </main>
  );
}




