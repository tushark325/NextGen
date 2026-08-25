"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Home,
  MapPin,
  DollarSign,
  Building2,
  Heart,
  Calendar,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { tenantPreferenceSchema } from "@/validations";
import type { TenantPreferenceInput } from "@/validations";
import { INDIAN_CITIES, PROPERTY_TYPES, FURNISHING_TYPES, COMMON_AMENITIES } from "@/types";

const STEPS = [
  { id: 1, title: "About You", icon: Home, description: "Your occupation and lifestyle profile" },
  { id: 2, title: "Target Sectors", icon: MapPin, description: "Where you want to live" },
  { id: 3, title: "Budget Matrix", icon: DollarSign, description: "Your rental threshold" },
  { id: 4, title: "Architecture", icon: Building2, description: "Layout and configuration" },
  { id: 5, title: "Lifestyle", icon: Heart, description: "Daily habits & preferences" },
  { id: 6, title: "Timeline", icon: Calendar, description: "Move-in schedule" },
  { id: 7, title: "Amenities", icon: Sparkles, description: "Essential infrastructure" },
  { id: 8, title: "Synthesis", icon: Shield, description: "Activate AI Matching" },
];

export default function TenantOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<TenantPreferenceInput> & { occupation?: string; company?: string; employmentType?: string }>({
    preferredCities: [],
    preferredLocalities: [],
    propertyTypes: [],
    furnishing: [],
    requiredAmenities: [],
    maxRent: 25000,
  });

  const handleNext = (data: Partial<TenantPreferenceInput>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (step < STEPS.length) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSkip = () => {
    if (step < STEPS.length) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tenant/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Profile synthesized! Entering Command Center...");
        router.push("/dashboard");
      } else {
        toast.error(json.error?.message ?? "Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStep = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-[#050814] text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cyber Grid */}
      <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/15 via-violet-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-violet-600 p-[1px] shadow-holo-sm">
              <div className="w-full h-full bg-[#070b1e] rounded-[11px] flex items-center justify-center">
                <Home className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <span className="font-display text-xl font-bold text-white tracking-wide">NextGen 3D</span>
          </div>
          <div className="text-cyan-300 font-mono text-xs">AI Calibration Step {step} of {STEPS.length}</div>
        </div>

        {/* Step Progress Nodes */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  "step-dot transition-all duration-500",
                  i + 1 < step
                    ? "step-dot--complete"
                    : i + 1 === step
                    ? "step-dot--active"
                    : "step-dot--pending"
                )}
              />
            ))}
          </div>
        </div>

        {/* Glass Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-400/30 shadow-holo-lg animate-scale-in scanline-effect">
          {/* Step icon */}
          <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-holo-sm">
              <currentStep.icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">{currentStep.title}</h1>
              <p className="text-white/60 text-xs">{currentStep.description}</p>
            </div>
          </div>

          {/* Step content */}
          <div className="mb-8">
            {step === 1 && <Step1About data={formData} onNext={handleNext} />}
            {step === 2 && <Step2Location data={formData} onNext={handleNext} />}
            {step === 3 && <Step3Budget data={formData} onNext={handleNext} />}
            {step === 4 && <Step4Property data={formData} onNext={handleNext} />}
            {step === 5 && <Step5Lifestyle data={formData} onNext={handleNext} />}
            {step === 6 && <Step6MoveIn data={formData} onNext={handleNext} />}
            {step === 7 && <Step7Amenities data={formData} onNext={handleNext} />}
            {step === 8 && (
              <Step8Verification
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="rounded-xl text-white/70 hover:text-white text-xs"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-white/40 hover:text-white rounded-xl text-xs"
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Step1About({ data, onNext }: { data: any; onNext: (d: any) => void }) {
  const [occupation, setOccupation] = useState(data.occupation ?? "");
  const [company, setCompany] = useState(data.company ?? "");
  const [employment, setEmployment] = useState<string>("SALARIED");

  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="text-xs font-mono uppercase text-cyan-300 mb-1.5 block">Occupation *</label>
        <input
          className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-cyan-400"
          placeholder="e.g. Senior Software Engineer"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs font-mono uppercase text-cyan-300 mb-1.5 block">Company / University</label>
        <input
          className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-cyan-400"
          placeholder="e.g. Google / IIT Bombay"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs font-mono uppercase text-cyan-300 mb-1.5 block">Employment Type *</label>
        <div className="grid grid-cols-2 gap-2">
          {employmentTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setEmployment(t.value)}
              className={cn(
                "px-4 py-3 rounded-xl border text-xs font-medium text-left transition-all",
                employment === t.value
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-holo-sm font-bold"
                  : "bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <Button
        className="w-full rounded-xl h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-holo-sm"
        onClick={() => onNext({ occupation, company, employmentType: employment })}
        disabled={!occupation}
      >
        Continue <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

function Step2Location({ data, onNext }: { data: Partial<TenantPreferenceInput>; onNext: (d: any) => void }) {
  const [cities, setCities] = useState<string[]>(data.preferredCities ?? []);

  const toggle = (city: string) => {
    setCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  return (
    <div className="space-y-4 text-left">
      <p className="text-white/60 text-xs">Select metropolitan sectors for your match universe.</p>
      <div className="grid grid-cols-3 gap-2">
        {INDIAN_CITIES.map((city) => (
          <button
            key={city}
            onClick={() => toggle(city)}
            className={cn(
              "px-3 py-2.5 rounded-xl border text-xs font-medium transition-all",
              cities.includes(city)
                ? "bg-cyan-500 text-white border-cyan-400 shadow-holo-sm font-bold"
                : "bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40"
            )}
          >
            {cities.includes(city) && <Check className="w-3 h-3 inline mr-1" />}
            {city}
          </button>
        ))}
      </div>
      <Button
        className="w-full rounded-xl h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-holo-sm"
        onClick={() => onNext({ preferredCities: cities })}
        disabled={cities.length === 0}
      >
        Continue <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

function Step3Budget({ data, onNext }: { data: Partial<TenantPreferenceInput>; onNext: (d: any) => void }) {
  const [maxRent, setMaxRent] = useState(data.maxRent ?? 35000);

  return (
    <div className="space-y-6 text-left">
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-mono uppercase text-cyan-300">Maximum Budget Limit</label>
          <span className="font-display font-bold text-2xl text-cyan-300">
            ₹{maxRent.toLocaleString("en-IN")}/mo
          </span>
        </div>
        <input
          type="range"
          min={5000}
          max={200000}
          step={2500}
          value={maxRent}
          onChange={(e) => setMaxRent(parseInt(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-mono text-white/40 mt-1">
          <span>₹5,000</span>
          <span>₹2,00,000</span>
        </div>
      </div>
      <Button
        className="w-full rounded-xl h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-holo-sm"
        onClick={() => onNext({ maxRent })}
      >
        Continue <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

function Step4Property({ data, onNext }: { data: Partial<TenantPreferenceInput>; onNext: (d: any) => void }) {
  const [types, setTypes] = useState<string[]>(data.propertyTypes ?? []);
  const [minBeds, setMinBeds] = useState(data.minBedrooms ?? 2);
  const [furnishing, setFurnishing] = useState<string[]>(data.furnishing ?? []);

  const toggleType = (t: string) => setTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);
  const toggleFurnish = (f: string) => setFurnishing((p) => p.includes(f) ? p.filter((x) => x !== f) : [...p, f]);

  return (
    <div className="space-y-5 text-left">
      <div>
        <label className="text-xs font-mono uppercase text-cyan-300 mb-2 block">Architecture Type</label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((pt) => (
            <button key={pt.value} onClick={() => toggleType(pt.value)}
              className={cn("px-3 py-1.5 rounded-xl border text-xs font-medium transition-all",
                types.includes(pt.value) ? "bg-cyan-500 text-white border-cyan-400 font-bold" : "bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40"
              )}>
              {pt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-mono uppercase text-cyan-300 mb-2 block">Bedrooms</label>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((n) => (
            <button key={n} onClick={() => setMinBeds(n)}
              className={cn("flex-1 h-11 rounded-xl border text-xs font-bold transition-all",
                minBeds === n ? "bg-cyan-500 text-white border-cyan-400 shadow-holo-sm" : "bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40"
              )}>
              {n === 0 ? "Studio" : `${n} BHK`}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-mono uppercase text-cyan-300 mb-2 block">Furnishing Level</label>
        <div className="flex gap-2">
          {FURNISHING_TYPES.map((ft) => (
            <button key={ft.value} onClick={() => toggleFurnish(ft.value)}
              className={cn("flex-1 py-2 rounded-xl border text-xs font-medium transition-all",
                furnishing.includes(ft.value) ? "bg-cyan-500 text-white border-cyan-400 font-bold" : "bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40"
              )}>
              {ft.label}
            </button>
          ))}
        </div>
      </div>
      <Button className="w-full rounded-xl h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-holo-sm" onClick={() => onNext({ propertyTypes: types, minBedrooms: minBeds, furnishing })}>
        Continue <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

function Step5Lifestyle({ data, onNext }: { data: Partial<TenantPreferenceInput>; onNext: (d: any) => void }) {
  const [prefs, setPrefs] = useState({
    petsAllowed: data.petsAllowed,
    smokingAllowed: data.smokingAllowed,
    parkingRequired: data.parkingRequired,
    workFromHome: data.workFromHome,
    quietEnvironment: data.quietEnvironment,
  });

  const options = [
    { key: "petsAllowed", label: "🐾 I have pets", sub: "Need a pet-friendly compound" },
    { key: "parkingRequired", label: "🚗 Dedicated parking required", sub: "Covered car parking essential" },
    { key: "workFromHome", label: "💻 Work from home setup", sub: "High-speed fiber connectivity" },
    { key: "quietEnvironment", label: "🤫 Low noise requirement", sub: "Acoustic peace for focused living" },
  ];

  const toggle = (key: string) =>
    setPrefs((p) => ({ ...p, [key]: !p[key as keyof typeof p] }));

  return (
    <div className="space-y-4 text-left">
      <p className="text-white/60 text-xs">Select lifestyle parameters to calculate compatibility.</p>
      <div className="space-y-2">
        {options.map((o) => (
          <button
            key={o.key}
            onClick={() => toggle(o.key)}
            className={cn(
              "w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all",
              prefs[o.key as keyof typeof prefs]
                ? "bg-cyan-500/15 border-cyan-400 text-white font-semibold"
                : "bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/30"
            )}
          >
            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
              prefs[o.key as keyof typeof prefs] ? "border-cyan-400 bg-cyan-500" : "border-white/30"
            )}>
              {prefs[o.key as keyof typeof prefs] && <Check className="w-3 h-3 text-white" />}
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{o.label}</div>
              <div className="text-[11px] text-white/50">{o.sub}</div>
            </div>
          </button>
        ))}
      </div>
      <Button className="w-full rounded-xl h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-holo-sm" onClick={() => onNext(prefs)}>
        Continue <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

function Step6MoveIn({ data, onNext }: { data: Partial<TenantPreferenceInput>; onNext: (d: any) => void }) {
  const [moveInDate, setMoveInDate] = useState(
    data.moveInDate ? new Date(data.moveInDate).toISOString().split("T")[0] : ""
  );
  const [minStay, setMinStay] = useState(data.minStayMonths ?? 11);

  return (
    <div className="space-y-5 text-left">
      <div>
        <label className="text-xs font-mono uppercase text-cyan-300 mb-1.5 block">Target Move-in Date</label>
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={moveInDate}
          onChange={(e) => setMoveInDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-xs focus:outline-none focus:border-cyan-400"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-mono uppercase text-cyan-300">Intended Lease Duration</label>
          <span className="font-mono font-bold text-cyan-300 text-sm">{minStay} months</span>
        </div>
        <input
          type="range"
          min={1}
          max={24}
          value={minStay}
          onChange={(e) => setMinStay(parseInt(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />
      </div>
      <Button
        className="w-full rounded-xl h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-holo-sm"
        onClick={() => onNext({ moveInDate: moveInDate ? new Date(moveInDate) : undefined, minStayMonths: minStay })}
      >
        Continue <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

function Step7Amenities({ data, onNext }: { data: Partial<TenantPreferenceInput>; onNext: (d: any) => void }) {
  const [selected, setSelected] = useState<string[]>(data.requiredAmenities ?? []);
  const toggle = (a: string) => setSelected((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a]);

  return (
    <div className="space-y-4 text-left">
      <p className="text-white/60 text-xs">Select essential amenities for your living space.</p>
      <div className="flex flex-wrap gap-2">
        {COMMON_AMENITIES.map((a) => (
          <button key={a} onClick={() => toggle(a)}
            className={cn("px-3 py-1.5 rounded-xl border text-xs font-medium transition-all",
              selected.includes(a) ? "bg-cyan-500 text-white border-cyan-400 font-bold shadow-holo-sm" : "bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40"
            )}>
            {selected.includes(a) && "✓ "}{a}
          </button>
        ))}
      </div>
      <Button className="w-full rounded-xl h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-holo-sm" onClick={() => onNext({ requiredAmenities: selected })}>
        Continue <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

function Step8Verification({ onSubmit, isSubmitting }: { onSubmit: () => void; isSubmitting: boolean }) {
  return (
    <div className="space-y-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center mx-auto shadow-holo-md">
        <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />
      </div>
      <div>
        <h2 className="font-display font-bold text-xl text-white mb-1">Calibration Complete!</h2>
        <p className="text-white/60 text-xs">
          Your profile parameters are ready to synthesize live 3D Mutual Match calculations.
        </p>
      </div>
      <div className="bg-white/5 rounded-2xl p-4 text-left space-y-2 border border-white/10">
        {[
          "Personalized 3D Match Universe activation",
          "Two-way compatibility score for every property",
          "Direct contact with verified KYC landlords",
          "Real-time application tracking dashboard",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs text-white/80">
            <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <Button
        className="w-full rounded-xl h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-holo-md border border-cyan-400/40"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Synthesizing your spatial matrix..." : "Enter Command Center →"}
      </Button>
    </div>
  );
}

const employmentTypes = [
  { value: "SALARIED", label: "Salaried Professional" },
  { value: "SELF_EMPLOYED", label: "Self Employed / Founder" },
  { value: "FREELANCER", label: "Freelancer / Consultant" },
  { value: "STUDENT", label: "Student" },
  { value: "RETIRED", label: "Retired" },
  { value: "UNEMPLOYED", label: "Other" },
];
