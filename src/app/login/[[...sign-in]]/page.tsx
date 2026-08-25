import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/60">Sign in to your NextGen account</p>
        </div>
        <SignIn
          routing="hash"
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/register"
          appearance={{
            elements: {
              card: "shadow-2xl border-0 rounded-2xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "rounded-xl border-border",
              formButtonPrimary: "rounded-xl bg-primary hover:bg-primary/90 font-medium",
              formFieldInput: "rounded-xl border-border",
              footerActionLink: "text-primary hover:text-primary/80",
            },
          }}
        />
      </div>
    </div>
  );
}
