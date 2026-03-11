// page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { QRCodeSVG } from 'qrcode.react';
import styles from './page.module.css';

export default function OtpSetup() {
  const router = useRouter();
  const [loginresult, setloginresult] = useState(null);
  const [otpQR, setotpQR] = useState("");
  const [otpsecret, setotpsecret] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('loginresult');

    //잘못된 접근 차단
    if (!raw) {
      router.push('/');
      return;
    }

    setloginresult(JSON.parse(raw));
    setotpQR(JSON.parse(raw).otp_QR);
    setotpsecret(JSON.parse(raw).otp_sk);
    sessionStorage.removeItem('otpData');
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(otpsecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!loginresult) return <p>Loading...</p>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Google Authenticator 등록</h2>
        <p className={styles.subtitle}>아래 QR코드를 Google Authenticator 앱으로 스캔하세요</p>

        <div className={styles.qrBox}>
          <QRCodeSVG value={otpQR} size={280} />
        </div>

        <div className={styles.secretSection}>
          <p className={styles.secretLabel}>앱 사용이 어려우면 아래 키를 수동 입력하세요</p>
          <div className={styles.secretBox}>
            <span className={styles.secretKey}>{otpsecret}</span>
            <button onClick={handleCopy} className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}>
              {copied ? "✓ 복사됨" : "복사"}
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className={styles.submitBtn}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          등록 완료 → 로그인 화면으로
        </button>
      </div>
    </div>
  );
}