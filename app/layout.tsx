import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata = {
  title: "ur nook",
  description: "Design your room in 3D and see how your furniture fits before you move. Built by iceeyou.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#5fc9e8",
              colorBackground: "#141a22",
              colorInputBackground: "#1a222c",
              colorInputText: "#dfe6ee",
              colorText: "#dfe6ee",
              colorTextSecondary: "#7c8a99",
              colorNeutral: "#dfe6ee",
              borderRadius: "8px",
              fontFamily: "-apple-system, 'Segoe UI', Inter, Roboto, sans-serif",
            },
            elements: {
              card: { border: "1px solid #232d38", boxShadow: "none" },
              footerActionLink: { color: "#5fc9e8" },
            },
          }}
        >
          <header>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
