"use client";

import React, { useMemo, useState, useEffect, useRef} from "react";
import { useRouter, useParams } from "next/navigation";

import isLogin from "@/app/lib/login/islogin";
import { IsLoginApiData_data } from "@/types/api";

import styles from './page.module.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";


//페이지 view단
export default function Page() {
  const router = useRouter();
  const didRun = useRef(false);//useEffect 중복 호출방지

  useEffect(() => 
  {
    //useEffect 중복 호출방지
    if (didRun.current) return;
    didRun.current = true;

    //현재 브라우저가 로그인된 상태인지 확인. 없으면 로그인 제한
    (async () => {
      const isLoginResult:IsLoginApiData_data = await isLogin();
      if(isLoginResult.haveSession == false)
      {
        toast.error("접근 권한이 없습니다.");
        setTimeout(() => {
          router.push("/web/login");;
        }, 1000);
      }
    })();

  }, []);

  return (
    <main className={styles.mainWrapper}>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className={styles.gridContainer}>

        <div className={`${styles.card} ${styles.card1}`} onClick={() => router.push("/web/wpage/viewpage/introduction")}>
          <div className={styles.cardTop}>
            <div className={styles.cardTitle}>소개</div>
            <div className={styles.cardDesc}>소개 및 안내</div>
          </div>
          {/* <div className={styles.cardArrow}>↗</div> */}
          <img className={styles.cardImage1} src={"/image/userimg.jpg"} />
        </div>

        <div className={`${styles.card} ${styles.card2}`} onClick={() => router.push("/web/tasksummary")}>
          <div className={styles.cardTop}>
            <div className={styles.cardTitle}>업무 요약</div>
            <div className={styles.cardDesc}>진행 중인 작업 현황 확인</div>
          </div>
          {/* <div className={styles.cardArrow}>↗</div> */}
          <img className={styles.cardImage2} src={"/image/projectsimg.jpg"} />
        </div>

        <div className={`${styles.card} ${styles.card4}`} onClick={() => router.push("/web/wpage/managepage")}>
          <div className={styles.cardTop}>
            <div className={styles.cardTitle}>문서 목록</div>
            <div className={styles.cardDesc}>웹 사이트<br/> 문서 목록 관리</div>
          </div>
          {/* <div className={styles.cardArrow}>↗</div> */}
          <img className={styles.cardImage3} src={"/image/documents_img.jpg"} />
        </div>

        <div className={`${styles.card} ${styles.card3}`} onClick={() => router.push("/web/manageimage/viewimagelist")}>
          <div className={styles.cardTop}>
            <div className={styles.cardTitle}>미디어 파일 목록</div>
            <div className={styles.cardDesc}>웹 사이트<br/> 미디어파일 관리</div>
          </div>
          {/* <div className={styles.cardArrow}>↗</div> */}
          <img className={styles.cardImage4} src={"/image/album_img.png"} />
        </div>

        <div className={`${styles.card} ${styles.card5}`} onClick={() => router.push("/web/wpage/viewpage/test")}>
          <div className={styles.cardTop}>
            <div className={styles.cardTitle}>테스팅</div>
            <div className={styles.cardDesc}>기능 테스트</div>
          </div>
          {/* <div className={styles.cardArrow}>↗</div> */}
          <img className={styles.cardImage5} src={"/image/paper_pen_img.png"} />
        </div>

      </div>
    </main>
  );
}