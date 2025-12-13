import { Link } from "react-router-dom";
import { Coins, Twitter, Github, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-16 border-t border-border/50 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold">VestFlow</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Secure token vesting for modern teams. Simple, transparent, and reliable.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link to="/create" className="hover:text-foreground transition-colors">Create Schedule</Link></li>
              <li><Link to="/schedules" className="hover:text-foreground transition-colors">All Schedules</Link></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Smart Contracts</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Security Audits</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VestFlow. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ for the Web3 community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
