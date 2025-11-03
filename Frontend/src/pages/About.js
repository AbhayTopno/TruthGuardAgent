import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function About() {
  const titleRef = useRef(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    // Animate title - faster
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );

    // Animate sections on scroll - faster
    sectionsRef.current.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }, []);

  const teamMembers = [
    { emoji: '👨‍💻', role: 'Developers', desc: 'Building robust solutions' },
    { emoji: '🔬', role: 'Researchers', desc: 'Ensuring accuracy' },
    { emoji: '🎨', role: 'Designers', desc: 'Crafting user experience' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 lg:px-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg px-2">
            About TruthGuard
          </h1>
          <div className="h-1 w-16 sm:w-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
        </div>

        {/* Main Description */}
        <div
          ref={(el) => (sectionsRef.current[0] = el)}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 hover:bg-white/15 transition-all duration-300"
        >
          <p className="text-base sm:text-lg text-white leading-relaxed mb-3 sm:mb-4">
            <strong className="text-lg sm:text-xl text-blue-300">
              TruthGuard
            </strong>{' '}
            is a comprehensive AI-powered fact-checking platform designed to
            combat misinformation across all digital channels. Built with
            cutting-edge technology and a commitment to truth, we provide
            real-time verification services that help users distinguish fact
            from fiction in today's information-saturated world. 🛡️
          </p>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed">
            Our platform integrates seamlessly with WhatsApp, Telegram, web
            browsers, and desktop applications, making fact-checking accessible
            wherever you need it. Using advanced AI algorithms, natural language
            processing, and multiple verification sources, we deliver fast,
            accurate, and trustworthy results.
          </p>
        </div>

        {/* What We Do Section */}
        <div
          ref={(el) => (sectionsRef.current[1] = el)}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <span className="text-3xl sm:text-4xl">💡</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              What We Do
            </h2>
          </div>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-3 sm:mb-4">
            TruthGuard analyzes claims, news articles, social media posts, and
            viral messages using multiple verification techniques:
          </p>
          <ul className="space-y-2 text-white/80 text-sm sm:text-base">
            <li className="flex items-start space-x-2">
              <span className="text-green-400">✓</span>
              <span>
                <strong>Cross-referencing</strong> with trusted news sources and
                fact-checking databases
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400">✓</span>
              <span>
                <strong>AI-powered analysis</strong> using natural language
                processing and machine learning
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400">✓</span>
              <span>
                <strong>Real-time verification</strong> delivering results in
                seconds
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400">✓</span>
              <span>
                <strong>Evidence-based reporting</strong> with sources and
                confidence scores
              </span>
            </li>
          </ul>
        </div>

        {/* Mission Section */}
        <div
          ref={(el) => (sectionsRef.current[2] = el)}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-4xl">🎯</span>
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          </div>
          <p className="text-base text-white/90 leading-relaxed mb-3">
            To empower individuals, journalists, researchers, and organizations
            worldwide with instant access to reliable fact-checking tools. We
            believe that everyone deserves the ability to distinguish truth from
            falsehood, regardless of where or how they encounter information.
          </p>
          <p className="text-base text-white/80 leading-relaxed">
            By making verification as simple as sending a message or clicking a
            button, we're democratizing access to truth and helping build a more
            informed society.
          </p>
        </div>

        {/* Technology Section */}
        <div
          ref={(el) => (sectionsRef.current[3] = el)}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-4xl">🚀</span>
            <h2 className="text-2xl font-bold text-white">Our Technology</h2>
          </div>
          <p className="text-base text-white/90 leading-relaxed mb-4">
            Built on a modern tech stack, TruthGuard combines the best of web
            and AI technologies:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="text-blue-300 font-semibold mb-2 flex items-center space-x-2">
                <span>⚛️</span>
                <span>Frontend</span>
              </h4>
              <p className="text-white/70 text-sm">
                React, Tailwind CSS, GSAP animations for a modern, responsive
                interface
              </p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="text-purple-300 font-semibold mb-2 flex items-center space-x-2">
                <span>🐍</span>
                <span>Backend</span>
              </h4>
              <p className="text-white/70 text-sm">
                Flask REST API with Python for robust server-side processing
              </p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="text-green-300 font-semibold mb-2 flex items-center space-x-2">
                <span>🤖</span>
                <span>AI Engine</span>
              </h4>
              <p className="text-white/70 text-sm">
                ADK Agent with advanced NLP and machine learning models
              </p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="text-cyan-300 font-semibold mb-2 flex items-center space-x-2">
                <span>📡</span>
                <span>Integrations</span>
              </h4>
              <p className="text-white/70 text-sm">
                WhatsApp, Telegram APIs, and browser extensions for
                multi-platform access
              </p>
            </div>
          </div>
        </div>

        {/* Challenges Section */}
        <div
          ref={(el) => (sectionsRef.current[4] = el)}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-4xl">💪</span>
            <h2 className="text-2xl font-bold text-white">
              Solving Big Challenges
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                icon: '📰',
                text: 'Combatting fake news and viral misinformation',
              },
              {
                icon: '✨',
                text: 'Making fact-checking easy and accessible',
              },
              {
                icon: '💬',
                text: 'Integrating verification into daily chats and browsing',
              },
              {
                icon: '🔐',
                text: 'Privacy-focused, user-friendly AI solutions',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <p className="text-white/80">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div
          ref={(el) => (sectionsRef.current[5] = el)}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-4xl">👥</span>
            <h2 className="text-2xl font-bold text-white">Meet the Team</h2>
          </div>
          <p className="text-base text-white/90 mb-6 leading-relaxed">
            A passionate group of developers, researchers, and designers
            committed to digital truth and information integrity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                <div className="text-6xl mb-4">{member.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {member.role}
                </h3>
                <p className="text-white/70">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="backdrop-blur-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Join Us in the Fight Against Misinformation
            </h3>
            <p className="text-white/80 mb-6">
              Together, we can build a more truthful digital world.
            </p>
            <a
              href="/console"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 px-8 rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-105"
            >
              Start Verifying Now →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
