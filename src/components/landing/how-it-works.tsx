import { UserPlus, ClipboardList, Sparkles, MessageSquare, Calendar, KeyRound } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Create your profile",
    description: "Tell us who you are — your occupation, lifestyle, and what you need in a home.",
    color: "from-brand-500 to-brand-600",
    lightBg: "bg-brand-50 dark:bg-brand-950",
    lightIcon: "text-brand-600",
  },
  {
    icon: ClipboardList,
    number: "02",
    title: "Set your requirements",
    description: "Budget, location, bedrooms, furnishing, move-in date — set it once, never re-enter.",
    color: "from-purple-500 to-purple-600",
    lightBg: "bg-purple-50 dark:bg-purple-950",
    lightIcon: "text-purple-600",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Get matched instantly",
    description: "Our engine scores every property for you — budget fit, location, landlord acceptance.",
    color: "from-pink-500 to-rose-600",
    lightBg: "bg-pink-50 dark:bg-pink-950",
    lightIcon: "text-pink-600",
  },
  {
    icon: MessageSquare,
    number: "04",
    title: "Connect with owners",
    description: "Chat directly with verified landlords. No middlemen. No brokerage unless specified.",
    color: "from-orange-500 to-amber-500",
    lightBg: "bg-orange-50 dark:bg-orange-950",
    lightIcon: "text-orange-600",
  },
  {
    icon: Calendar,
    number: "05",
    title: "Schedule a visit",
    description: "Book in-person or video tours at your convenience. Landlords confirm instantly.",
    color: "from-teal-500 to-green-600",
    lightBg: "bg-teal-50 dark:bg-teal-950",
    lightIcon: "text-teal-600",
  },
  {
    icon: KeyRound,
    number: "06",
    title: "Move in seamlessly",
    description: "Digital agreements, payment tracking, and maintenance requests — all in one place.",
    color: "from-indigo-500 to-brand-600",
    lightBg: "bg-indigo-50 dark:bg-indigo-950",
    lightIcon: "text-indigo-600",
  },
];

export function HowItWorks() {
  return (
    <section className="section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Rent smarter in 6 steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From profile to keys — the whole rental journey, simplified.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              <div className="card-elevated h-full group-hover:border-primary/30 group-hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${step.lightBg} flex items-center justify-center shrink-0`}>
                    <step.icon className={`w-6 h-6 ${step.lightIcon}`} />
                  </div>
                  <span className="font-display text-4xl font-bold text-muted-foreground/20 leading-none mt-1">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
