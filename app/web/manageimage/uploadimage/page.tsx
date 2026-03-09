"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect, useRef} from "react";
import styles from './page.module.css';
import { useRouter } from "next/navigation";

import { IsLoginApiData_data } from "@/types/api";
import isLogin from "@/app/lib/login/islogin";

type UploadResponse = {
  ok: boolean;
  filename?: string;
  meta?: Record<string, string>;
  message?: string;
};

export default function ImageUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const didRun = useRef(false);//useEffect 중복 호출방지

  //이미지 업로드로 인한 파일미리보기
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;

    // 이전 미리보기 있으면 URL 해제. 메모리 누수방지
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(f);
    setResult(null);
    setError(null);

    // if (f && f.type === 'application/pdf') {
    //   alert('PDF 파일은 미리보기가 제공되지 않습니다.');
    //   console.log('PDF 파일은 미리보기가 제공되지 않습니다.');
    //   return;
    // }

    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  //이미지 업로드. api로 전송준비
  const handleSubmit = async (e: FormEvent) => 
  {
    e.preventDefault();
    setResult(null);
    setError(null);

    if (!file) {
      setError("파일을 선택해 주세요.");
      return;
    }

    // 간단한 확장자 체크
    const ext = file.name.toLowerCase();
    if (
      !ext.endsWith(".jpg") &&
      !ext.endsWith(".jpeg") &&
      !ext.endsWith(".png") &&
      !ext.endsWith(".pdf")
    ) {
      setError("jpg / png / pdf 파일만 업로드할 수 있습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "meta",
      JSON.stringify({"username":username,"description":description})
    );
    
    //백엔드전송하는 api로 전달
    try {
      setIsUploading(true);
      const res = await fetch("/api/uploadMultimedia", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`업로드 실패: ${res.status}`);
      }

      const data: UploadResponse = await res.json();
      setResult(data);
    } 
    catch (err: any) 
    {
      console.error(err);
      setError(err.message ?? "업로드 중 오류가 발생했습니다.");
    } 
    finally {
      setIsUploading(false);
    }
  };

  // 이전 미리보기 있으면 URL 해제. 메모리 누수방지
  // 컴포넌트 언마운트 시에도 해제(안전장치)
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    //현재 브라우저가 로그인된 상태인지 확인. 없으면 로그인 제한
    (async () => {
      const isLoginResult:IsLoginApiData_data = await isLogin();
      console.log(isLoginResult);
      if(isLoginResult.usertype != "admin")
      {
        alert("접근 권한이 없습니다. 현재 유저타입 : "+isLoginResult.usertype);
        router.push("/web/main");
      }
    })();

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <main className="">
      <div className="">
        <h1 className="">파일 업로드</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 파일 선택 */}
          <div className="">
            <label className="">파일 (jpg, png, pdf)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              onChange={handleFileChange}
              className=""
            />
          </div>

          {/* 메타데이터 입력 */}
          <div className="space-y-1">
            <label className="">username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className=""
              placeholder="작성자 이름"
            />
          </div>

          <div className="">
            <label className="">description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className=""
              placeholder="이미지 설명"
              rows={3}
            />
          </div>

          {/* 미리보기 */}
          {previewUrl && (
            <div className="">
              <div className="">미리보기</div>
              <img src={previewUrl} alt="preview" className="imagePreviewSection" />
            </div>
          )}

          {/* 전송 버튼 */}
          <button
            type="submit"
            disabled={isUploading}
            className=""
          >
            {isUploading ? "업로드 중..." : "업로드"}
          </button>
        </form>

        {/* 결과 / 에러 표시 */}
        {error && (
          <div className="">
            {error}
          </div>
        )}

        {result && (
          <div className="">
            <div>ok: {String(result.ok)}</div>
            {result.filename && <div>filename: {result.filename}</div>}
            {result.message && <div>message: {result.message}</div>}
            {result.meta && (
              <div>
                meta:
                <pre className="">
                  {/* {JSON.stringify(result.meta, null, 2)} */}
                  업로드 완료
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
