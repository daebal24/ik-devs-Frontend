/*



*/

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function OtpSetup() {
  const router = useRouter();
  const [loginresult, setloginresult] = useState(null);
  const [otpcode, setcode] = useState("");

  // useEffect(() => {
  //   const raw = sessionStorage.getItem('loginresult');

  //   if (!raw) {
  //     alert("ERROR!");
  //     router.push('/');  // 데이터 없으면 홈으로 튕겨냄
  //     return;
  //   }

  //   setloginresult(JSON.parse(raw));
  //   console.log(raw);
  //   sessionStorage.removeItem('otpData');  // 읽자마자 삭제
  // }, []);

  // if (!loginresult) return <p>Loading...</p>;

  //테스트값

  
  async function otplogin() {
    try {
      if (!otpcode) return alert("코드를 입력하세요.");

      //otpcode
      //loginresult
      const id = 'test';//loginresult.id;
      const usertype = 'admin';//loginresult.usertype;

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
          <div className={styles.subtitle}>OTP코드를 입력하여 로그인해주세요</div>
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

        <button className={styles.btn} onClick={() => otplogin()}>
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




