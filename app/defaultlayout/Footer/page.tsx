// 🔹 Footer 컴포넌트
export default function Footer() {
    return (
      <footer
        style={{
          // background: "linear-gradient(to right, #94b8ee, #504df3)",
          background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,20,0.3))",
          padding: "12px 24px",
          textAlign: "center",
          fontSize: "0.9rem",
          color: "#ffffff",
        }}
      >
        © {new Date().getFullYear()} Dae ik. All rights reserved.
      </footer>
    );
  }