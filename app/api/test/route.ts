// app/api/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try 
  {
    // Spring Boot 백엔드 API 호출
    const res = await fetch(`${process.env.BACKENDAPI}/api/testDB`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      // CORS 피하기 위해 필요할 수 있음: 다음줄 제거 X
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error(`백엔드 응답 오류: ${res.status}`);
    }

    // 백엔드에서 받은 JSON 파싱
    const data = await res.json();

    // 프론트엔드로 그대로 전달 (또는 가공 가능)
    return NextResponse.json({
      ok: true,
      message: "백엔드 데이터 정상 수신 ✅",
      data
    });
  } catch (err: any) {
    console.error("API fetch 실패:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}