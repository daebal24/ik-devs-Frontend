"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter  } from "next/navigation";
import styles from "./page.module.css";
import CustomMarkdown from "@/app/lib/customMarkdown/CustomMarkdown";
import {viewPageData, ViewMediaData, IsLoginApiData_data} from "@/types/api";
import isLogin from "@/app/lib/login/islogin";


async function saveText(pagename: string, content: string, pagememo: string) {
  if (confirm("정말 진행하시겠습니까?")) {
    try {
      const content_encoded = Buffer.from(content, "utf8").toString("base64");
      const res = await fetch("/api/commonapi", {
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({
          apiname: "updatePageData",
          bodydata: { pagename: pagename, content: content_encoded, memo:pagememo },
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      } else {
        alert("Save Complete");
      }
    } catch (error) {
      console.log(error);
      throw new Error(`Request failed: ${error}`);
    }
  } else return;
}

const EXAMPLE = `@@@@@@@@@@@testExample@@@@@@@@@@@`;

//페이지 view단
export default function Page() {
  const [pagememo, setPagememo] = useState("");
  const [raw, setRaw] = useState(EXAMPLE);
  const [imageraw, setimagelist] = useState<ViewMediaData[]>([]);
  const [confirmedText, setConfirmedText] = useState<string | null>("");

  const isPreview = confirmedText !== null;
  const router = useRouter(); //하이퍼링크

  // 페이지 파라미터 수신
  const inputparameter = useParams<{ params?: string[] }>();
  const params = inputparameter.params;
  let params_result = params
    ? Array.isArray(params)
      ? params.join("/")
      : params
    : "(파라미터 없음)";

  //백엔드 연결
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const didRun = useRef(false);//useEffect 중복 호출방지

  //데이터 불러오기
  useEffect(() => {
    //useEffect 중복 호출방지
    if (didRun.current) return;
    didRun.current = true;

    
    (async () => {
      //현재 브라우저가 로그인된 상태인지 확인. 없으면 로그인 제한
      const isLoginResult:IsLoginApiData_data = await isLogin();
      if(isLoginResult.haveSession == false)
      {
        alert("접근 권한이 없습니다.");
        router.push("/web/login");
        return;
      }
    })();

    async function fetchData()
    {
      try 
      {
        setError(null);

        const res = await fetch("/api/commonapi", {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            apiname: "viewPageData",
            bodydata: { pagename: params_result },
          }),
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const json = await res.json();
        const api_memo = json.data[0].memo;
        const api_content = json.data[0].content;

        const apiresult: string = JSON.stringify(
          json.data[0].content,
          null,
          2
        ).replace(/^"(.*)"$/, "$1");

        console.log("@@ res : "+apiresult);
        if (json.data[0].id == 0) {
          router.push("/error/notexistwpage");
        }

        const decoded = Buffer.from(apiresult, "base64").toString("utf8");
        console.log(decoded);
        setRaw(decoded);
        setPagememo(api_memo);
        setConfirmedText(decoded);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchImage() 
    {
        try {
          setError(null);

          const res = await fetch("/api/commonapi", {
            method: "POST",
            cache: "no-store",
            body: JSON.stringify({
              apiname: "viewMediaData",
            }),
          });

          if (!res.ok) {
            throw new Error(`Request failed: ${res.status}`);
          }

          const json = await res.json();
          console.log("image here : ");
          console.log(json);

          // ✅ 배열 통째로 상태에 저장
          setimagelist(json.data as ViewMediaData[]);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setLoading(false);
        }
    }
    function getImageFilenameByName(targetName:string) 
    {
      const found = imageraw.find(
        (item) => item.name === targetName && item.filetype === "image"
      );
      return found ? found.filename : null;
    }

    fetchImage();
    fetchData();
    
    console.log("Page Parameter : " + params_result);
  }, []); // 한 번만 실행

  return (
    <main>
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
          {/* 문서제목입력 */}
          <input 
          onChange={(e) => setPagememo(e.target.value)}
          value={pagememo}
          placeholder="어떤 문서인지 작성해주세요"
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
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="여기에 커스텀 마크다운을 입력하세요"
            style={{
              width: "98%",
              minHeight: 300,
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
      <p>추가 또는 수정 후 우측 상단 저장버튼을 눌러야 저장됩니다.</p>
      <section
        aria-label="미리보기"
        style={{
          width: "98%",
          border: "1px dotted #e5e7eb",
          borderRadius: 10,
          padding: 16,
          background: "#f3f8ff"
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
              onClick={() => saveText(params_result, raw, pagememo)}
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
          style={{ marginTop: 12, marginLeft:"2%", marginRight:"2%", background: "#fff", padding: 16, borderRadius: 8 }}
        >
          {/* 커스텀 마크다운 렌더 */}
          <CustomMarkdown
            source={isPreview ? confirmedText! : raw}
            imageMap={imageraw}
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
          업로드된 파일 : [file:파일태그] <br />
        </p>
      </details >
    </main>
  );
}
