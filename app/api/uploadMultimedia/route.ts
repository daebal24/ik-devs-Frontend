// app/api/uploadMultimedia/route.ts
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_UPLOAD_URL = `${process.env.BACKENDAPI}/api/uploadMultimedia`;

export async function POST(req: NextRequest) 
{
  try 
  {
    // 클라이언트에서 온 multipart/form-data 파싱
    const formData = await req.formData();

    // 백엔드로 그대로 전송
    const backendRes = await fetch(BACKEND_UPLOAD_URL, {
      method: "POST",
      body: formData,
      // FormData 를 보낼 때는 Content-Type 을 직접 지정하지 않습니다.
    });

    //백엔드 응답처리
    const status = backendRes.status;
    const data = await backendRes.json();
    return NextResponse.json(data, { status });

  } 
  catch (error) 
  {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        message: "업로드 중 서버에서 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
