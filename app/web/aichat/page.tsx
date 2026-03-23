"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { IsLoginApiData_data } from "@/types/api";
import isLogin from "@/app/lib/login/islogin";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";

// ───── 타입 정의 ─────
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type ChatResponse = {
  success: boolean;
  data: {
    reply?: string;
  };
  error?: string;
}

// ───── 컴포넌트 ─────
export default function ChatPage() {
  const router = useRouter();
  const didRun = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // ── 로그인 체크 ──
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      const loginResult: IsLoginApiData_data = await isLogin();
      if (!loginResult.haveSession) {
        toast.error("접근 권한이 없습니다.");
        setTimeout(() => router.push("/web/login"), 1000);
        return;
      }
    })();

    // 환영 메시지
    setMessages([
      {
        role: "assistant",
        content: "안녕하세요! 무엇이든 물어보세요.",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // ── 새 메시지 오면 스크롤 하단 이동 ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // ── 전송 처리 ──
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setIsThinking(true);

    try {
      const res = await fetch("/api/commonapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
              apiname: "aichat",
              bodydata: { message: text},
            }),
      });

      if (!res.ok) throw new Error(`요청 실패: ${res.status}`);

      const json: ChatResponse = await res.json();

      setIsThinking(false);

      if (json.error) {
        toast.error(json.error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: json.data.reply ?? "(응답 없음)",
          timestamp: new Date(),
        },
      ]);
    } catch (e) {
      setIsThinking(false);
      toast.error((e as Error).message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "서버와 연결할 수 없습니다.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // ── Enter 키 처리 (Shift+Enter = 줄바꿈) ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── textarea 자동 높이 조절 ──
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  // ── 대화 초기화 ──
  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "대화가 초기화되었습니다. 무엇이든 물어보세요!",
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

  return (
    <main className={styles.wrapper}>
      <ToastContainer position="top-center" autoClose={3000} />

      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>AI</div>
          <div>
            <div className={styles.headerTitle}>AI 어시스턴트</div>
            <div className={styles.headerStatus}>
              <span className={styles.statusDot} />
              온라인
            </div>
          </div>
        </div>
        <button className={styles.clearBtn} onClick={clearChat} title="대화 초기화">
          초기화
        </button>
      </header>

      {/* 메시지 목록 */}
      <section className={styles.messageArea}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.messageRow} ${
              msg.role === "user" ? styles.userRow : styles.assistantRow
            }`}
          >
            {msg.role === "assistant" && (
              <div className={styles.avatar}>AI</div>
            )}
            <div className={styles.bubbleWrap}>
              <div
                className={`${styles.bubble} ${
                  msg.role === "user" ? styles.userBubble : styles.assistantBubble
                }`}
              >
                {msg.content}
              </div>
              <div className={styles.timestamp}>{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}

        {/* 로딩 말풍선 */}
        {isThinking && (
          <div className={`${styles.messageRow} ${styles.assistantRow}`}>
            <div className={styles.avatar}>AI</div>
            <div className={styles.bubbleWrap}>
              <div className={`${styles.bubble} ${styles.assistantBubble} ${styles.thinkingBubble}`}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      {/* 입력 영역 */}
      <footer className={styles.inputArea}>
        <textarea
          ref={inputRef}
          className={styles.textarea}
          placeholder="메시지를 입력하세요... (Enter 전송 / Shift+Enter 줄바꿈)"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
        />
        <button
          className={styles.sendBtn}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          전송
        </button>
      </footer>
    </main>
  );
}
