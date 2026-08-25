import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    city: "Mumbai",
    avatar: "PS",
    rating: 5,
    text: "Found my 2 BHK in Powai within a week! The match score told me exactly why each property was or wasn't right for me. Saved so much time compared to random browsing.",
    matchScore: 94,
  },
  {
    name: "Rahul Mehta",
    role: "Startup Founder",
    city: "Bangalore",
    avatar: "RM",
    rating: 5,
    text: "As a landlord, I used to get dozens of irrelevant inquiries. Now I get 5 well-matched applications and rent within 2 weeks. The tenant scoring is incredibly accurate.",
    matchScore: null,
    isLandlord: true,
  },
  {
    name: "Ananya Krishnan",
    role: "MBA Student",
    city: "Pune",
    avatar: "AK",
    rating: 5,
    text: "The WFH preference filter and commute estimation were game-changers. I found a quiet apartment near my college with parking. The landlord even matched my lifestyle.",
    matchScore: 88,
  },
  {
    name: "Vikram Nair",
    role: "Property Manager",
    city: "Hyderabad",
    avatar: "VN",
    rating: 5,
    text: "Managing 12 properties used to be chaos. Now everything — listings, applications, agreements — is in one place. My occupancy rate went from 74% to 96%.",
    matchScore: null,
    isLandlord: true,
  },
  {
    name: "Sneha Joshi",
    role: "Doctor",
    city: "Chennai",
    avatar: "SJ",
    rating: 5,
    text: "Night shift-friendly filter + pet allowed + hospital proximity. I didn't think all three were possible in one apartment. NextGen found it for me in 3 days.",
    matchScore: 91,
  },
  {
    name: "Arjun Kapoor",
    role: "Marketing Manager",
    city: "Delhi",
    avatar: "AK",
    rating: 5,
    text: "The 'why this matches you' breakdown is brilliant. I could see exactly how the rent, location, and amenities scored. No more guessing if a place is worth visiting.",
    matchScore: 87,
  },
];

export function TestimonialsSection() {
  return (
    <section className="section bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Loved by renters and landlords
          </h2>
          <p className="text-muted-foreground text-lg">
            Real stories from people who found their match.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="card-elevated flex flex-col">
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-brand-200 mb-4 shrink-0" />

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-5">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role} · {t.city}</div>
                </div>
                {t.matchScore && (
                  <div className="shrink-0 px-2.5 py-1 bg-success-50 text-success-700 rounded-full text-xs font-bold border border-success-500/30">
                    {t.matchScore}% match
                  </div>
                )}
                {t.isLandlord && (
                  <div className="shrink-0 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold border border-brand-500/30">
                    Landlord
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
