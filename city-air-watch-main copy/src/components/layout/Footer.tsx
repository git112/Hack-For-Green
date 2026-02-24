import { Wind, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Wind className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">
                CleanAir<span className="text-primary">Gov</span>
              </span>
            </Link>
            <p className="text-background/70 text-sm max-w-md">
              Smart pollution monitoring and action platform. Together, we build a cleaner, healthier city for everyone.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/map" className="hover:text-primary transition-colors">Live Map</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Register</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
            </ul>
          </div>

          {/* Emergency Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Emergency</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-background/70">
                <Phone className="w-4 h-4 text-primary" />
                <span>1800-XXX-XXXX</span>
              </li>
              <li className="flex items-center gap-2 text-background/70">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@cleanairgov.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center text-sm text-background/50">
          © {new Date().getFullYear()} CleanAirGov. All rights reserved. A Government Initiative.
        </div>
      </div>
    </footer>
  );
}
