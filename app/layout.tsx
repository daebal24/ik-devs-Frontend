import Header from "./web/defaultlayout/Header/page";
import Footer from "./web/defaultlayout/Footer/page";

export const metadata = {
  title: "Hello. ik-dev",
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
            //background: "conic-gradient(#00c6ff, #0072ff, #00c6ff)"
            //
            //background: "conic-gradient(#f0f0f0, #124dbf, #f0f0f0)"
            //background: "radial-gradient(circle at 50% 50%,  #124dbf, #d9f1ff, #124dbf)",
            //background: "radial-gradient(circle at 50% 50%,  #464646, #000000)",
            background: "radial-gradient(circle at 50% 50%,  #464646, #2e2e2e, #464646)",
            //backgroundImage: "url('/image/ubcbeach.jpg')", backgroundSize: "cover",
            //backgroundImage: "url('/image/20260318_010648053.jpg')", backgroundSize: "cover",
            
            
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
              padding: "1%",
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
