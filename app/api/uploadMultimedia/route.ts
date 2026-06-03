// app/api/uploadMultimedia/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_UPLOAD_URL = `${process.env.BACKENDAPI}/api/uploadMultimedia`;

function extractJwtFromCookies(cookieHeader: string): string | null {
  const match = cookieHeader.match(/(?:^|;\s*)authToken=([^;]+)/);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const incomingCookies = req.headers.get("cookie") || "";
    const jwtToken = extractJwtFromCookies(incomingCookies);

    const backendRes = await fetch(BACKEND_UPLOAD_URL, {
      method: "POST",
      headers: {
        ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
      },
      body: formData,
    });

    const status = backendRes.status;
    const data = await backendRes.json();
    return NextResponse.json(data, { status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "업로드 중 서버에서 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
