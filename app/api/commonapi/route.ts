// app/api/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try 
  {
    // 1) 요청 파싱 (JSON이 아니어도 안전하게)
    const ctype = request.headers.get("content-type") || "";
    let apiname = "";
    let bodydata: any = {};
    if (ctype.includes("application/json")) {
      ({ apiname, bodydata } = await request.json());
    } else {
      const raw = await request.text();
      try {
        ({ apiname, bodydata } = JSON.parse(raw));
      } catch {
        throw new Error("요청 본문이 JSON이 아닙니다.");
      }
    }

    //브라우저가 보낸 쿠키를 읽어서 백엔드로 전달
    const incomingCookie = request.headers.get("cookie") || "";

    // 2) 스프링 백엔드 호출
    const apiURL = `${process.env.BACKENDAPI}/api/${apiname}`;
    const res = await fetch(apiURL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(incomingCookie ? { Cookie: incomingCookie } : {}), // 쿠키 전달
      },
      body: JSON.stringify(bodydata),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`백엔드 응답 오류: ${res.status}`);
    }

    // 3) 핵심: JSON 대신 text로 받고, 직접 안전 파싱, 
    // 백엔드가 내려준 Set-Cookie를 브라우저 응답으로 전달
    const backendText = await res.text();
    const setCookie = res.headers.get("set-cookie") || "";

    // BOM 제거 + 앞뒤 공백 제거
    const sanitized = backendText.replace(/^\uFEFF/, "").trim();

    let data: any;
    try {
      // (가끔 JSON 뒤에 쓰레기 문자가 붙는 백엔드 대비: 닫는 괄호까지 자르기)
      // 객체/배열의 마지막 닫힘을 찾아서 그 이전만 시도
      const lastBrace = Math.max(sanitized.lastIndexOf("}"), sanitized.lastIndexOf("]"));
      const maybeJson = lastBrace >= 0 ? sanitized.slice(0, lastBrace + 1) : sanitized;
      data = JSON.parse(maybeJson);
    } catch {
      // JSON이 아니면 raw 텍스트로 전달
      data = { raw: sanitized };
    }


    //프론트 화면으로 최종 응답 보냄
    const out = NextResponse.json(
      { ok: true, message: "백엔드 데이터 정상 수신", data },
      { status: 200 }
    );

    if (setCookie) {
      // set-cookie는 여러 개일 수 있는데, 우선 1개인 경우가 대부분이라 이대로도 동작.
      // 로그인 시 쿠키가 여러 개 내려오는 경우 res.headers.get("set-cookie")가 합쳐져서 올 수 있음
      // 그때는 set-cookie를 분리해서 여러 개로 붙여야 하는데, 지금 단계에선 대부분 JSESSIONID 1개라 위 코드로도 충분
      out.headers.set("set-cookie", setCookie);
    }
    return out;

  } 
  catch (err: any) 
  {
    console.error("API fetch 실패:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message || err) }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}
