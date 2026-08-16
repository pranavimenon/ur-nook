import { SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main
      style={{
        maxWidth: 480,
        margin: "0 auto",
        minHeight: "calc(100vh - 61px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "2px solid #5fc9e8",
          position: "relative",
          marginBottom: 20,
        }}
      >
        <div style={{ position: "absolute", inset: 6, border: "1px solid #5fc9e8", opacity: 0.6 }} />
      </div>
      <h1 style={{ fontSize: 30, marginBottom: 8, color: "#fff", letterSpacing: 0.5 }}>ur nook</h1>
      <p style={{ color: "#7c8a99", marginBottom: 6, lineHeight: 1.6, fontSize: 14.5 }}>
        Design your room in 3D, place your furniture, and see how it fits — before you move.
      </p>
      <p
        style={{
          color: "#5fc9e8",
          marginBottom: 36,
          fontSize: 11,
          fontFamily: "Consolas, 'IBM Plex Mono', monospace",
          letterSpacing: 1,
        }}
      >
        built by iceeyou
      </p>
      <SignedOut>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <SignInButton>
            <button
              style={{
                padding: "10px 22px",
                borderRadius: 6,
                border: "1px solid #232d38",
                background: "#1a222c",
                color: "#dfe6ee",
                cursor: "pointer",
                fontSize: 13.5,
              }}
            >
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button
              style={{
                padding: "10px 22px",
                borderRadius: 6,
                border: "1px solid #5fc9e8",
                background: "#2c5568",
                color: "#fff",
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </SignedOut>
    </main>
  );
}
