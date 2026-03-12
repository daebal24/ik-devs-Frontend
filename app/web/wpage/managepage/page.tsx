"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

import styles from './page.module.css';
import {viewPageData, IsLoginApiData_data} from '@/types/api';
import isLogin from "@/app/lib/login/islogin";

// type ViewMediaData=
// {
//   name:string;
//   memo:string;
//   filename:string;
//   filetype:string;
// }

// export type ApiData_viewPageData = {
//   ok: boolean;
//   message: string;
//   data: {
//     id: number;
//     content: string;
//     pagename: string;
//   }[];
// };
  

// function imagelist(input:ViewMediaData[])
// {
//   console.log(input);

//   //정보가 담긴 배열을 넘겨받으면 앨범생성
//   const items = [];
//   for (let i = 0; i < input.length; i++) {
//     items.push(<div className={`${styles.card}`}><img src="" />{input[i].name}</div>);
//   }
//   return <div>{items}</div>;
// }

//페이지 view단
export default function Page() {
  const router = useRouter();
  const didRun = useRef(false);//useEffect 중복 호출방지

  // 페이지 파라미터 수신. params는 있을 수도 있고(undefined), 여러 개일 수도 있음(string[])
  const inputparameter = useParams<{ params?: string[] }>();
  const params = inputparameter.params;
  let params_result = params ? Array.isArray(params) ? params.join("/") : params : "(파라미터 없음)";

  //백엔드 연결
  
  const [raw, setRaw] = useState<viewPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState("");

  // ✅ 페이지가 렌더링되면 자동으로 한 번 API 호출
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
          alert("접근 권한이 없습니다.");
          router.push("/web/login");
          return;
        }
      })();
      
      async function fetchData() {
        try {
          setError(null);

          const res = await fetch("/api/commonapi", {
            method: "POST",
            cache: "no-store",
            body: JSON.stringify({
              apiname: "viewPageDataAll",
            }),
          });

          if (!res.ok) {
            throw new Error(`Request failed: ${res.status}`);
          }

          const json = await res.json();
          console.log("here : ");
          console.log(json);

          // ✅ 배열 통째로 상태에 저장
          setRaw(json.data as viewPageData[]);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setLoading(false);
        }
      }

      fetchData();
    }, []);


    return (
    <main className={styles.mainWrapper}>
      <div className={styles.toolbar}>
        <button className={styles.topBtn} onClick={() => router.push("/web/wpage/createpage")}>문서 생성</button>
      </div>
      <div className={styles.gridContainer}>
        {loading && <div className={styles.loading}>로딩 중...</div>}
        {error && <div className={styles.errorMsg}>에러: {error}</div>}

        {!loading &&
          !error &&
          raw.map((item) => (
            <div className={styles.card} key={item.pagename}>
              <button className={styles.cardBtn} onClick={() => router.push(`/web/wpage/viewpage/${item.pagename}`)}>
                {item.pagename}
              </button>
              <div className={styles.memo}>{item.memo}</div>
            </div>
          ))
        }
      </div>
    </main>
  );
}
