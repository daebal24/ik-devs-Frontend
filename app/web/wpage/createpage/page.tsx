"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter  } from "next/navigation";
import styles from "./page.module.css";
import CustomMarkdown from "@/app/lib/customMarkdown/CustomMarkdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";

//로그인
import isLogin from "@/app/lib/login/islogin";
import { IsLoginApiData_data } from "@/types/api";

export type ApiData = {
  ok: boolean;
  message: string;
  data: {
    id: number;
    content: string;
    pagename: string;
  }[];
};

/**
 * 커스텀 마크다운 사용법
 *
 * [box] ... [/box]
 * [box width=400 height=200 padding=20 bg=#fff border=#000 radius=6 display=inline-block] ... [/box]
 * [font size=24 color=#ff0000] ... [/font]
 * [comment] ... [/comment]  // ✅ 화면에 렌더링되지 않는 주석
 * [comment author=kim date=2026-01-02] ... [/comment]
 * 줄바꿈: <br />
 * 공백N칸: [space:N]
 * 하이퍼링크: [aout:https://example.com/]텍스트[/aout]
 */


const EXAMPLE = `테스트입력데이터`;

//페이지 view단
export default function Page() {
  const [pagetitle, setPagetitle] = useState("");
  const [pagememo, setPagememo] = useState("");
  const [raw, setRaw] = useState("");
  const [confirmedText, setConfirmedText] = useState<string | null>("");

  const isPreview = confirmedText !== null;
  const router = useRouter();
  const didRun = useRef(false);//useEffect 중복 호출방지

  async function saveText(pagename: string, content: string, memo: string) 
  {
    if(pagename == null || pagename == '' || content == null || content == '' || memo == null || memo == '')
    {
      toast.warn("문서주소와 내용, 설명을 채워주세요");
      return;
    }
    if (confirm("정말 진행하시겠습니까?")) {
      try {
        const content_encoded = Buffer.from(content, "utf8").toString("base64");
        const res = await fetch("/api/commonapi", {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            apiname: "insertPageData",
            bodydata: { pagename: pagename, content: content_encoded, memo:memo},
          }),
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        } 
        else {
          const save_result = await res.json();
          console.log();
          if(save_result.data.raw == "Success")
          {
            toast.success("저장 완료");
            router.push("/web/wpage/managepage");
          }
          else if(save_result.data.raw == "AlreadyExist")
          {
            toast.warn("문서제목이 중복됩니다. 다른 제목을 사용해주세요");
          }
          else
          {
            console.log(save_result);
            toast.error("Unknown Error");
          }
            
        }
      } catch (error) {
        console.log(error);
        throw new Error(`Request failed: ${error}`);
      }
    } 
    else 
      return;
  }


  //첫 로딩 실행
  useEffect(() => 
  {
    //StrictMode로 effect가 두 번 타도 첫 번째만 처리하게 막기
    if (didRun.current) return;
    didRun.current = true;
    
    //샘플 텍스트 입력
    //setConfirmedText(EXAMPLE);
    setConfirmedText(null);

    //현재 브라우저가 로그인된 상태인지 확인. 없으면 로그인 제한
    (async () => {
      const isLoginResult:IsLoginApiData_data = await isLogin();
      if(isLoginResult.usertype != "admin")
      {
        toast.error("접근 권한이 없습니다. 현재 유저타입 : "+isLoginResult.usertype);
        setTimeout(() => {
            router.push("/web/main");
          }, 1000);
        return;        
      }
    })();

  }, []); 

  return (
    <main>
      <ToastContainer position="top-center" autoClose={3000} />
      {/* 편집 영역 */}
      {!isPreview && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {/* 문서페이지 주소 입력 */}
          <input 
          onChange={(e) => setPagetitle(e.target.value)}
          value={pagetitle}
          placeholder="여기에 문서 페이지 URL을 입력해주세요"
          style={{
              width: "60%",
              resize: "vertical",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
              fontSize: 14,
              lineHeight: 1.6,
              padding: 12,
              border: "1px solid #ccc",
              borderRadius: 8,
            }}
          />
          {/* 문서 제목 or 설명 */}
          <input 
          onChange={(e) => setPagememo(e.target.value)}
          value={pagememo}
          placeholder="여기에 문서제목 또는 설명 입력하세요"
          style={{
              width: "60%",
              resize: "vertical",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
              fontSize: 14,
              lineHeight: 1.6,
              padding: 12,
              border: "1px solid #ccc",
              borderRadius: 8,
            }}
          />
          {/* 문서내용입력 */}
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="여기에 내용을 입력하세요. 마크다운 지원"
            style={{
              width: "100%",
              minHeight: 220,
              resize: "vertical",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
              fontSize: 14,
              lineHeight: 1.6,
              padding: 12,
              border: "1px solid #ccc",
              borderRadius: 8,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setConfirmedText(raw)}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              확인
            </button>
            <span style={{ alignSelf: "center", opacity: 0.6, fontSize: 13 }}>
              ※ “확인”을 누르면 아래에 서식 적용 결과가 표시됩니다.
            </span>
          </div>
        </section>
      )}

      {/* 미리보기 / 결과 */}
      <section
        aria-label="미리보기"
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 16,
          background: "#fafafa",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>결과</h2>
          {isPreview && (
            <button
              onClick={() => setConfirmedText(null)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              수정하기
            </button>
          )}
          {isPreview && (
            <button
              onClick={() => saveText(pagetitle, raw, pagememo)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              저장하기
            </button>
          )}
        </div>

        <div
          style={{ marginTop: 12, background: "#fff", padding: 16, borderRadius: 8 }}
        >
          {/* 커스텀 마크다운 렌더 */}
          <CustomMarkdown
            source={isPreview ? confirmedText! : raw}
          />
        </div>
      </section>

      {/* 실시간 미리보기 안내 (편집 모드일 때) */}
      {!isPreview && (
        <p style={{ marginTop: 10, opacity: 0.6, fontSize: 13 }}>
          입력 중에도 아래 “결과” 영역에서 실시간으로 렌더링을 확인할 수 있습니다.
        </p>
      )}

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        커스텀 마크다운 지원목록
      </h1>
      <details >
        <p style={{ opacity: 0.7, marginBottom: 16 }}>
          지원목록: <br />
          박스 : <code>[box]...[/box]</code>, <br />
          박스(크기/스타일) :{" "}
          <code>
            [box width=400 height=200 padding=20 bg=#fff border=#000 radius=6]...[/box]
          </code>
          , <br />
          폰트 : <code>[font size=24 color=#f00]...[/font]</code>, <br />
          주석 : <code>[comment]...[/comment]</code>, <br />
          줄바꿈 : <code>{"<br />"}</code> <br />
          공백N칸 : <code>[space:N]</code> <br />
          하이퍼링크(내부페이지) : [a_page:tasksummary]테스크서머리[/a_page] <br />
          하이퍼링크(외부페이지) : [aout:https://www.naver.com/]네이버[/aout] <br />
        </p>
      </details >
    </main>
  );
}
