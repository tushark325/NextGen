import Link from "next/link";
import { Home, Twitter, Linkedin, Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl">NextGen</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              India's smartest rental marketplace. Smart matching, verified homes,
              trusted connections.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Linkedin, Instagram, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>&copy; 2025 NextGen Technologies Pvt. Ltd. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const footerLinks = [
  {
    title: "For Tenants",
    links: [
      { label: "Search Properties", href: "/search" },
      { label: "Get Matched", href: "/register?role=TENANT" },
      { label: "How it Works", href: "/#how-it-works" },
      { label: "Tenant Guide", href: "/guide/tenant" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "For Landlords",
    links: [
      { label: "List Property", href: "/register?role=LANDLORD" },
      { label: "Find Tenants", href: "/landlord" },
      { label: "Pricing", href: "/pricing" },
      { label: "Landlord Guide", href: "/guide/landlord" },
      { label: "Property Manager", href: "/register?role=AGENT" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Report Abuse", href: "/report" },
    ],
  },
];
