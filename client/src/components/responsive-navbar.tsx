import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  external?: boolean;
}

interface ResponsiveNavbarProps {
  logo?: {
    icon?: React.ReactNode;
    text: string;
    href?: string;
  };
  navItems: NavItem[];
  actionButton?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export default function ResponsiveNavbar({
  logo = {
    icon: <Zap className="w-6 h-6 text-primary-foreground" />,
    text: "Zyra",
    href: "/"
  },
  navItems,
  actionButton,
  className
}: ResponsiveNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavItemClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    }
    closeMenu();
  };

  const renderNavItem = (item: NavItem, index: number, isMobile: boolean = false) => {
    const baseClassName = cn(
      "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md",
      isMobile
        ? "block w-full text-left px-4 py-3 text-lg font-medium text-foreground hover:text-primary hover:bg-muted"
        : "text-muted-foreground hover:text-foreground px-2 py-1"
    );

    if (item.href) {
      if (item.external) {
        return (
          <a
            key={index}
            href={item.href}
            className={baseClassName}
            onClick={() => isMobile && closeMenu()}
            data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {item.label}
          </a>
        );
      } else {
        return (
          <Link
            key={index}
            href={item.href}
            className={baseClassName}
            onClick={() => isMobile && closeMenu()}
            data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {item.label}
          </Link>
        );
      }
    }

    return (
      <button
        key={index}
        onClick={() => handleNavItemClick(item)}
        className={baseClassName}
        data-testid={`nav-button-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {item.label}
      </button>
    );
  };

  const renderActionButton = (isMobile: boolean = false) => {
    if (!actionButton) return null;

    const content = (
      <Button
        className={cn(
          "gradient-button",
          isMobile ? "w-full text-lg py-3" : ""
        )}
        onClick={() => {
          if (actionButton.onClick) {
            actionButton.onClick();
          }
          if (isMobile) {
            closeMenu();
          }
        }}
        data-testid={`action-button-${actionButton.label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {actionButton.label}
      </Button>
    );

    if (actionButton.href) {
      return (
        <Link
          href={actionButton.href}
          onClick={() => isMobile && closeMenu()}
        >
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-border",
      className
    )}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            {logo.href ? (
              <Link
                href={logo.href}
                className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                data-testid="nav-logo"
              >
                {logo.icon && (
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    {logo.icon}
                  </div>
                )}
                <span className="text-2xl font-bold text-foreground">{logo.text}</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                {logo.icon && (
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    {logo.icon}
                  </div>
                )}
                <span className="text-2xl font-bold text-foreground">{logo.text}</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => renderNavItem(item, index, false))}
            {renderActionButton(false)}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className="md:hidden text-foreground p-2 hover:bg-muted rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            data-testid="button-mobile-menu"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          ref={menuRef}
          id="mobile-menu"
          className={cn(
            "md:hidden fixed left-0 right-0 top-full bg-background/95 dark:bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300 ease-in-out",
            isOpen
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible -translate-y-2"
          )}
          role="menu"
          aria-labelledby="mobile-menu"
        >
          <div className="container mx-auto px-6 py-6 space-y-2">
            {navItems.map((item, index) => (
              <div key={index} role="menuitem">
                {renderNavItem(item, index, true)}
              </div>
            ))}
            {actionButton && (
              <div className="pt-4 border-t border-border">
                {renderActionButton(true)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}