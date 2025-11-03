import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsRef = useRef([]);
  const ctaRef = useRef(null);
  const floatingRef = useRef([]);

  useEffect(() => {
    // Hero section fade in - faster
    gsap.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });

    // Title animation - faster
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power3.out',
        delay: 0.1,
      }
    );

    // Subtitle animation - faster
    gsap.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.2,
      }
    );

    // Tech stack cards stagger animation - faster
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 30, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.3,
      }
    );

    // CTA button animation - faster
    gsap.fromTo(
      ctaRef.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.4,
      }
    );

    // Floating animation for background elements
    floatingRef.current.forEach((el, index) => {
      gsap.to(el, {
        y: 'random(-20, 20)',
        x: 'random(-20, 20)',
        rotation: 'random(-10, 10)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.2,
      });
    });

    // Hover effect for CTA button
    const ctaButton = ctaRef.current;
    const handleMouseEnter = () => {
      gsap.to(ctaButton, {
        scale: 1.05,
        boxShadow: '0 20px 60px rgba(59, 130, 246, 0.5)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };
    const handleMouseLeave = () => {
      gsap.to(ctaButton, {
        scale: 1,
        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    ctaButton.addEventListener('mouseenter', handleMouseEnter);
    ctaButton.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      ctaButton.removeEventListener('mouseenter', handleMouseEnter);
      ctaButton.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const techStack = [
    { name: 'React', color: 'from-cyan-400 to-blue-500', icon: '⚛️' },
    { name: 'Tailwind CSS', color: 'from-sky-400 to-cyan-500', icon: '🎨' },
    { name: 'Flask Backend', color: 'from-gray-600 to-gray-800', icon: '🐍' },
    {
      name: 'AI ADK Agent',
      color: 'from-green-400 to-emerald-500',
      icon: '🤖',
    },
    { name: 'WhatsApp API', color: 'from-green-500 to-green-600', icon: '💬' },
    { name: 'Telegram Bot', color: 'from-blue-500 to-blue-600', icon: '✈️' },
    {
      name: 'Browser Extension',
      color: 'from-purple-500 to-pink-500',
      icon: '🔌',
    },
  ];

  return (
    <section
      ref={heroRef}
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (floatingRef.current[i] = el)}
            className="absolute rounded-full opacity-10 blur-3xl"
            style={{
              width: `${Math.random() * 250 + 100}px`,
              height: `${Math.random() * 250 + 100}px`,
              background: `radial-gradient(circle, ${
                i % 2 === 0
                  ? 'rgba(59, 130, 246, 0.4)'
                  : 'rgba(139, 92, 246, 0.4)'
              } 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-start items-center px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Main Title with Glassmorphism */}
        <div
          ref={titleRef}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-2xl"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent leading-tight drop-shadow-lg pb-3 sm:pb-4">
            TruthGuard Agent
          </h1>
          <div className="mt-2 sm:mt-3 h-1 w-16 sm:w-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
        </div>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="max-w-3xl mb-6 sm:mb-8 text-center text-sm sm:text-base md:text-lg lg:text-xl font-medium text-white leading-relaxed backdrop-blur-sm bg-white/10 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/20 shadow-lg"
        >
          AI-powered fact verification across{' '}
          <span className="text-blue-400 font-bold">web</span>,{' '}
          <span className="text-green-400 font-bold">WhatsApp</span>,{' '}
          <span className="text-blue-300 font-bold">Telegram</span>, and{' '}
          <span className="text-purple-400 font-bold">desktop</span>. Verify
          claims instantly with confidence and evidence! 🛡️
        </p>

        {/* Tech Stack Cards */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-center text-white/80 font-semibold text-sm sm:text-base mb-3 sm:mb-4 tracking-wider uppercase">
            Powered By
          </h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-4xl px-2">
            {techStack.map((tech, index) => (
              <div
                key={tech.name}
                ref={(el) => (cardsRef.current[index] = el)}
                className="group relative backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl sm:hover:px-5 sm:hover:py-3"
              >
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-base sm:text-xl">{tech.icon}</span>
                  <span className="font-semibold text-white text-xs sm:text-sm">
                    {tech.name}
                  </span>
                </div>
                {/* Gradient border effect on hover */}
                <div
                  className={`absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r ${tech.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          ref={ctaRef}
          onClick={() => navigate('/console')}
          className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-2.5 px-6 sm:py-3 sm:px-8 rounded-full text-base sm:text-lg font-bold shadow-2xl transition-all duration-300 overflow-hidden mb-8 sm:mb-12"
        >
          <span className="relative z-10 flex items-center space-x-1.5 sm:space-x-2">
            <span>🚀 Try Fact Checking Console</span>
          </span>
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        </button>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
          {[
            {
              icon: '⚡',
              title: 'Instant Verification',
              desc: 'Get fact-checked results in seconds using advanced AI',
            },
            {
              icon: '🔒',
              title: 'Secure & Private',
              desc: 'Your data stays protected with enterprise-grade security',
            },
            {
              icon: '🌐',
              title: 'Multi-Platform',
              desc: 'Works everywhere - browser, mobile apps, and desktop',
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-5 hover:bg-white/15 hover:p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h4 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-white/80 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Landing;
