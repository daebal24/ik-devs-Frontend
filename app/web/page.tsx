"use client";

import { useState, useEffect } from "react";
import type { ApiData } from "@/types/api";

let aaaa = "13qweqdzxczxdsa";

export default function Page() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true); // ✅ 페이지 로드 시 바로 로딩 시작
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState("");
  let result2 = "";

  // ✅ 페이지가 렌더링되면 자동으로 한 번 API 호출
  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);

        const res = await fetch("/api/test", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const json: ApiData = await res.json();
        //setData(json);
        setResult(JSON.stringify(json, null, 2)); // ← json으로 세팅 (data 아님)
        //setResult(JSON.stringify(json.data[1].name, null, 2)); // ← json으로 세팅 (data 아님)
        //setResult(json.data[1].name);
        
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchData(); // ✅ 컴포넌트가 처음 마운트될 때 실행
  }, []); // ✅ [] → 한 번만 실행 (렌더링마다 반복 호출 X)

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">/a 페이지</h1>
      <p>페이지가 열리면 /api/test 데이터를 자동으로 불러옵니다.</p>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="text-red-600">에러: {error}</p>}
      {/* {data && (
        <pre className="p-3 rounded-xl border overflow-x-auto">
        JSON.stringify(data, null, 2)
        </pre>
      )} */}
      {result && (
        <pre className="p-3 rounded-xl border overflow-x-auto">
        {result}
        </pre>
      )}
    </main>
  );
}



