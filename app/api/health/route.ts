//기본제공 api 예시
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    message: "Healthy ✅"
  });
}
