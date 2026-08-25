import { Building2, Users, Home, Star } from "lucide-react";

const stats = [
  { icon: Home, value: "50,000+", label: "Verified Properties", color: "text-brand-600" },
  { icon: Users, value: "2 Lakh+", label: "Happy Tenants", color: "text-purple-600" },
  { icon: Building2, value: "15,000+", label: "Trusted Landlords", color: "text-green-600" },
  { icon: Star, value: "4.8/5", label: "Average Rating", color: "text-amber-500" },
];

export function StatsSection() {
  return (
    <section className="py-12 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
