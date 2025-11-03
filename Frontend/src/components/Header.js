import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function Header() {
  const { pathname } = useLocation();
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileLinksRef = useRef([]);
  const hamburgerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    // Animate logo on mount
    gsap.fromTo(
      logoRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
    );

    // Stagger animate nav links on desktop
    if (linksRef.current.length > 0) {
      gsap.fromTo(
        linksRef.current.filter((el) => el !== null),
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.3,
        }
      );
    }

    // Scroll effect for navbar
    const showNav = gsap.fromTo(
      navRef.current,
      { y: 0 },
      {
        y: 0,
        paused: true,
        duration: 0.2,
      }
    );

    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      onUpdate: (self) => {
        self.direction === -1 ? showNav.play() : showNav.reverse();
      },
    });
  }, []);

  useEffect(() => {
    // Animate mobile menu
    if (isMobileMenuOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Animate overlay
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });

      // Slide in menu
      gsap.fromTo(
        mobileMenuRef.current,
        { x: '100%' },
        {
          x: '0%',
          duration: 0.5,
          ease: 'power3.out',
        }
      );

      // Stagger animate menu items
      gsap.fromTo(
        mobileLinksRef.current.filter((el) => el !== null),
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.08,
          delay: 0.2,
          ease: 'power2.out',
        }
      );

      // Animate hamburger to X
      gsap.to(hamburgerRef.current.children[0], {
        rotation: 45,
        y: 8,
        duration: 0.3,
        ease: 'power2.inOut',
      });
      gsap.to(hamburgerRef.current.children[1], {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.inOut',
      });
      gsap.to(hamburgerRef.current.children[2], {
        rotation: -45,
        y: -8,
        duration: 0.3,
        ease: 'power2.inOut',
      });
    } else {
      // Unlock body scroll
      document.body.style.overflow = 'unset';

      // Animate overlay out
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      });

      // Slide out menu
      gsap.to(mobileMenuRef.current, {
        x: '100%',
        duration: 0.4,
        ease: 'power3.in',
      });

      // Reset hamburger
      gsap.to(hamburgerRef.current.children[0], {
        rotation: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.inOut',
      });
      gsap.to(hamburgerRef.current.children[1], {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.inOut',
      });
      gsap.to(hamburgerRef.current.children[2], {
        rotation: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.inOut',
      });
    }
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const linkClass = (path) => {
    const isActive = pathname === path;
    return `relative px-3 py-2 transition-all duration-300 ${
      isActive
        ? 'text-blue-400 font-semibold'
        : 'text-white/90 hover:text-white'
    } group`;
  };

  const mobileLinkClass = (path) => {
    const isActive = pathname === path;
    return `relative px-6 py-4 transition-all duration-300 ${
      isActive
        ? 'text-blue-400 font-semibold bg-white/5'
        : 'text-white/90 hover:text-white hover:bg-white/5'
    } group block text-lg`;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/playground', label: 'Playground' },
    { path: '/about', label: 'About' },
    { path: '/console', label: 'Console' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 opacity-0 pointer-events-none lg:hidden"
        style={{ display: isMobileMenuOpen ? 'block' : 'none' }}
        onClick={closeMobileMenu}
      ></div>

      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 backdrop-blur-xl bg-gradient-to-r from-slate-900/80 via-blue-900/80 to-slate-900/80 border-b border-white/10 shadow-2xl"
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div
            ref={logoRef}
            className="flex items-center space-x-2 sm:space-x-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <svg
                className="relative w-8 h-8 sm:w-10 sm:h-10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"
                  fill="url(#shield-gradient)"
                  stroke="white"
                  strokeWidth="1"
                />
                <path
                  d="M9 12L11 14L15 10"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient
                    id="shield-gradient"
                    x1="3"
                    y1="2"
                    x2="21"
                    y2="23"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-wider bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              TruthGuard
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex space-x-1 text-base">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                ref={(el) => (linksRef.current[index] = el)}
                className={linkClass(link.path)}
                to={link.path}
              >
                <span className="relative z-10">{link.label}</span>
                {/* Hover effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                {/* Active indicator */}
                {pathname === link.path && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Hamburger Menu Button */}
          <button
            ref={hamburgerRef}
            onClick={toggleMobileMenu}
            className="lg:hidden relative z-50 w-10 h-10 flex flex-col justify-center items-center space-y-1.5 focus:outline-none group"
            aria-label="Toggle menu"
          >
            <span className="w-6 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:bg-blue-400"></span>
            <span className="w-6 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:bg-blue-400"></span>
            <span className="w-6 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:bg-blue-400"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Side Navbar */}
      <div
        ref={mobileMenuRef}
        className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 transform translate-x-full lg:hidden"
        style={{
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        }}
      >
        <div className="flex flex-col h-full pt-24 pb-8">
          {/* Mobile Menu Header */}
          <div className="px-6 pb-6 border-b border-white/10">
            <h3 className="text-white font-bold text-xl mb-2">Menu</h3>
            <p className="text-white/60 text-sm">
              Navigate to your destination
            </p>
          </div>

          {/* Mobile Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                ref={(el) => (mobileLinksRef.current[index] = el)}
                className={mobileLinkClass(link.path)}
                to={link.path}
                onClick={closeMobileMenu}
              >
                <span className="relative z-10 flex items-center justify-between">
                  <span>{link.label}</span>
                  {pathname === link.path && (
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </span>
                {/* Active indicator */}
                {pathname === link.path && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Footer */}
          <div className="px-6 pt-6 border-t border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">TruthGuard</p>
                <p className="text-white/60 text-xs">Fact-checking agent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
