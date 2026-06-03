// app/api/commonapi/route.ts
import { NextResponse } from "next/server";

const TOKEN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8시간 (백엔드 JWT 만료와 동일)

function extractJwtFromCookies(cookieHeader: string): string | null {
  const match = cookieHeader.match(/(?:^|;\s*)authToken=([^;]+)/);
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  try {
    // 1) 요청 파싱
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

    // 2) 브라우저 쿠키에서 JWT 추출 → Authorization 헤더로 변환
    const incomingCookies = request.headers.get("cookie") || "";
    const jwtToken = extractJwtFromCookies(incomingCookies);

    // 3) 스프링 백엔드 호출
    const apiURL = `${process.env.BACKENDAPI}/api/${apiname}`;
    const res = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
      },
      body: JSON.stringify(bodydata),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`백엔드 응답 오류: ${res.status}`);
    }

    // 4) 응답 파싱
    const backendText = await res.text();
    const sanitized = backendText.replace(/^﻿/, "").trim();

    let data: any;
    try {
      const lastBrace = Math.max(sanitized.lastIndexOf("}"), sanitized.lastIndexOf("]"));
      const maybeJson = lastBrace >= 0 ? sanitized.slice(0, lastBrace + 1) : sanitized;
      data = JSON.parse(maybeJson);
    } catch {
      data = { raw: sanitized };
    }

    const out = NextResponse.json(
      { ok: true, message: "백엔드 데이터 정상 수신", data },
      { status: 200 }
    );

    // 5) 로그인 성공 시 JWT를 HttpOnly 쿠키로 저장
    if (
      (apiname === "login" || apiname === "GoogleOTPLogin") &&
      data?.result === "ok" &&
      data?.token
    ) {
      out.headers.set(
        "set-cookie",
        `authToken=${data.token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${TOKEN_COOKIE_MAX_AGE}`
      );
    }

    // 6) 로그아웃 시 JWT 쿠키 삭제
    if (apiname === "deleteLoginSession") {
      out.headers.set(
        "set-cookie",
        `authToken=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0`
      );
    }

    return out;
  } catch (err: any) {
    console.error("API fetch 실패:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message || err) }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}
