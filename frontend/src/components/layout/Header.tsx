import { motion } from "framer-motion";
import { Wallet, Menu, X, LayoutDashboard, PlusCircle, BarChart3, Copy, ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { truncateAddress } from "@/lib/stacks-utils";
import { getAddressUrl } from "@/lib/stacks-config";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Create Schedule", href: "/create", icon: PlusCircle },
  { label: "All Schedules", href: "/schedules", icon: BarChart3 },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  
  // Use real wallet connection
  const { isConnected, userAddress, connect, disconnect, isConnecting } = useWallet();

  const handleCopyAddress = () => {
    if (userAddress) {
      navigator.clipboard.writeText(userAddress);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: "Wallet connected",
        description: "Successfully connected to your Stacks wallet",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet disconnected",
      description: "You have been disconnected from your wallet",
    });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="font-mono font-bold text-primary-foreground text-base">V</span>
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-accent opacity-50 blur-lg group-hover:opacity-75 transition-opacity" />
            </div>
            <div className="hidden sm:block">
              <span className="font-mono font-bold text-base text-foreground">VEST</span>
              <span className="font-mono text-base text-muted-foreground">.protocol</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center gap-2">
            {isConnected && userAddress ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {truncateAddress(userAddress)}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-background border-border">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-[10px] text-muted-foreground mb-1">Connected Wallet</p>
                    <p className="font-mono text-xs truncate">{userAddress}</p>
                  </div>
                  <DropdownMenuItem onClick={handleCopyAddress} className="gap-2 cursor-pointer">
                    <Copy className="w-3.5 h-3.5" />
                    Copy Address
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a 
                      href={getAddressUrl(userAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View on Explorer
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDisconnect} 
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="hero" 
                size="sm"
                onClick={handleConnect}
                disabled={isConnecting}
                className="gap-1.5 h-8 text-xs"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </span>
                <span className="sm:hidden">
                  {isConnecting ? '...' : 'Connect'}
                </span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
        >
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
