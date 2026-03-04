import Header from "./defaultlayout/Header/page";
import Footer from "./defaultlayout/Footer/page";

export const metadata = {
  title: "@TITLE",
  description: "Project"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "ui-sans-serif, system-ui",
          margin: 0,
          minHeight: "100dvh",
          position: "relative",
        }}
      >
        {/* 배경 전용 레이어 — 이것만 blur 적용 */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            // backgroundImage: "url('/image/ubcbeach.jpg')",
            // backgroundSize: "cover",
            // backgroundPosition: "center",
            // filter: "blur(10px)",
            // transform: "scale(1.1)", // 가장자리 흰 테두리 방지
            background: "linear-gradient(to right, #d7e7ff, #f0f5ff)"
          }}
        />

        {/* 콘텐츠 레이어 — blur 영향 없음 */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: "100dvh",
          }}
        >
          <Header />
          <main
            style={{
              flex: 1,
              minHeight: 0,
              height: "100%",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
