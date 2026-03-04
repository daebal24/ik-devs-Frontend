"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();//react 하이퍼링크
  const didRun = useRef(false);//useEffect 중복 호출방지

  useEffect(() => {
    //useEffect 중복 호출방지
    if (didRun.current) return;
    didRun.current = true;

    router.push('/web/login')
  }, []);

  return (
    <main className="">
      <h1>redirecting..</h1>
    </main>
  );
}
