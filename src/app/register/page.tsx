"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { Home, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Suspense } from "react";

const roles = [
  {
    value: "TENANT",
    icon: Home,
    title: "I'm looking for a home",
    sub: "Find verified rentals matched to your lifestyle",
    color: "border-brand-500 bg-brand-50 dark:bg-brand-950",
    iconColor: "text-brand-600",
  },
  {
    value: "LANDLORD",
    icon: Building2,
    title: "I'm a property owner",
    sub: "List properties and find verified tenants",
    color: "border-purple-500 bg-purple-50 dark:bg-purple-950",
    iconColor: "text-purple-600",
  },
  {
    value: "AGENT",
    icon: Users,
    title: "I'm a property agent",
    sub: "Manage multiple properties and clients",
    color: "border-green-500 bg-green-50 dark:bg-green-950",
    iconColor: "text-green-600",
  },
];

function RegisterContent() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role")?.toUpperCase() ?? "";
  const [selectedRole, setSelectedRole] = useState(defaultRole || "TENANT");
  const [step, setStep] = useState<"role" | "signup">("role");

  if (step === "signup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-purple-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-white/60">
              Registering as{" "}
              <span className="text-brand-300 font-medium">
                {roles.find((r) => r.value === selectedRole)?.title}
              </span>
            </p>
          </div>
          <SignUp
            routing="hash"
            fallbackRedirectUrl="/onboarding"
            signInUrl="/login"
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
            unsafeMetadata={{ role: selectedRole }}
          />
          <button
            onClick={() => setStep("role")}
            className="mt-4 text-sm text-white/50 hover:text-white text-center w-full transition-colors"
          >
            ← Change role
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">NextGen</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Join NextGen</h1>
          <p className="text-white/60">How do you want to use NextGen?</p>
        </div>

        <div className="space-y-3 mb-6">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={cn(
                "w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200",
                selectedRole === role.value
                  ? role.color
                  : "bg-white/5 border-white/20 hover:border-white/40 hover:bg-white/10"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                selectedRole === role.value ? "bg-white/80" : "bg-white/10"
              )}>
                <role.icon className={cn("w-6 h-6", selectedRole === role.value ? role.iconColor : "text-white/70")} />
              </div>
              <div className="flex-1">
                <div className={cn("font-semibold", selectedRole === role.value ? "text-foreground" : "text-white")}>
                  {role.title}
                </div>
                <div className={cn("text-sm mt-0.5", selectedRole === role.value ? "text-muted-foreground" : "text-white/50")}>
                  {role.sub}
                </div>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                selectedRole === role.value ? "border-primary bg-primary" : "border-white/30"
              )}>
                {selectedRole === role.value && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setStep("signup")}
          className="w-full bg-white text-brand-700 font-bold py-4 rounded-2xl text-base hover:bg-white/90 transition-colors"
        >
          Continue as {roles.find((r) => r.value === selectedRole)?.title} →
        </button>

        <p className="text-center text-white/40 text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-brand-300 hover:text-brand-200">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
