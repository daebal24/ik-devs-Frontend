// 🔹 Header 컴포넌트
export default function Header() {
    return (
      <header
        style={{
          //background: "conic-gradient(#00c6ff, #0072ff, #00c6ff)",
          background: "linear-gradient(to bottom, rgba(30,40,120,0.65), rgba(30,40,120,0))",
          color: "white",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>ik-dev</h1>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <a href="/web/main" style={{ color: "white", textDecoration: "none" }}>Home</a>
          <a href="/web/login" style={{ color: "white", textDecoration: "none" }}>로그아웃</a>
        </nav>
      </header>
    );
  }