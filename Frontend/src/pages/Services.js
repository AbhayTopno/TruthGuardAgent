import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ServiceImageDisplay from '../components/ServiceImageDisplay';
import extensionPopup from '../assets/services/extension-1.png';
import extensionResult from '../assets/services/extension-2.png';
import whatsappImage from '../assets/services/whatsapp.jpeg';
import telegramImage from '../assets/services/telegram.jpeg';

function Services() {
  const titleRef = useRef(null);
  const sectionsRef = useRef([]);

  // Get contact info from environment variables
  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER;
  const telegramBotUrl = process.env.REACT_APP_TELEGRAM_BOT_URL;

  // Format WhatsApp number for URL (remove spaces, parentheses, and dashes)
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^\d+]/g, '')}`;

  useEffect(() => {
    // Smooth title animation with gentle fade
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
      }
    );

    // Animate sections on mount
    sectionsRef.current.forEach((section, index) => {
      if (section) {
        gsap.fromTo(
          section,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2 + index * 0.2,
            ease: 'power2.out',
          }
        );
      }
    });
  }, []);

  const services = [
    {
      icon: '🔌',
      title: 'Browser Extension',
      description:
        'Highlight and fact-check information on any website instantly. Works on Chrome, Firefox, and Edge.',
      color: 'from-purple-500 to-pink-600',
      features: [
        'Quick select',
        'Auto-scan',
        'Save reports',
        'Download markdown reports',
      ],
      images: [
        {
          src: extensionPopup,
          alt: 'Browser extension popup',
        },
        {
          src: extensionResult,
          alt: 'Browser extension verification result',
        },
      ],
      downloadLink: '/downloads/TrustGuard-Extension.zip',
      downloadText: 'Download Extension',
    },
    {
      icon: '💬',
      title: 'WhatsApp Verification',
      description:
        'Use our WhatsApp bot for easy fact-checking within chats. Just send a message and get instant verification.',
      color: 'from-green-500 to-emerald-600',
      features: [
        'Instant responses',
        'Group support',
        'Private chats',
        'Markdown formatted reports',
      ],
      images: [
        {
          src: whatsappImage,
          alt: 'WhatsApp verification bot in action',
        },
      ],
      link: whatsappUrl,
      linkText: 'Chat on WhatsApp',
    },
    {
      icon: '✈️',
      title: 'Telegram Bot',
      description:
        'Verify claims right inside Telegram groups or private messages. Fast, reliable, and always online.',
      color: 'from-blue-500 to-cyan-600',
      features: [
        'Bot commands',
        'Inline mode',
        'Channel support',
        'Clickable source links',
      ],
      images: [
        {
          src: telegramImage,
          alt: 'Telegram bot verification',
        },
      ],
      link: telegramBotUrl,
      linkText: 'Open Telegram Bot',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 lg:px-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title */}
        <div
          ref={titleRef}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
          style={{ opacity: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent px-2">
            Our Services
          </h1>
          <p className="text-white/70 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-4">
            Multi-platform fact verification solutions tailored to your needs
          </p>
          <div className="mt-4 sm:mt-6 h-1 w-20 sm:w-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Services Sections - Horizontal Layout (Text Left, Images Right) */}
        <div className="space-y-6 sm:space-y-8 lg:space-y-12 mb-8 sm:mb-12 lg:mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              ref={(el) => (sectionsRef.current[index] = el)}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 hover:bg-white/15 transition-all duration-700 hover:shadow-2xl hover:border-white/30"
              style={{ opacity: 0 }}
            >
              {/* Horizontal Layout: Conditional order based on service */}
              <div
                className={`flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 items-start ${
                  service.title === 'WhatsApp Verification'
                    ? 'lg:flex-row-reverse'
                    : ''
                }`}
              >
                {/* Text Content */}
                <div className="flex-1 min-w-0 w-full">
                  {/* Service Header */}
                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                    <div className="text-4xl sm:text-5xl lg:text-7xl flex-shrink-0">
                      {service.icon}
                    </div>
                    <h2
                      className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold pb-2 sm:pb-4 bg-gradient-to-r ${service.color} bg-clip-text text-transparent break-words`}
                    >
                      {service.title}
                    </h2>
                  </div>

                  <p className="text-white/80 text-sm sm:text-base lg:text-xl mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {service.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-1.5 sm:space-x-2 backdrop-blur-sm bg-white/5 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-full border border-white/10"
                      >
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-white/70 text-xs sm:text-sm lg:text-base whitespace-nowrap">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Call to Action Link */}
                  {service.link && (
                    <div className="mt-6">
                      <a
                        href={service.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center space-x-2 bg-gradient-to-r ${service.color} hover:opacity-90 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base`}
                      >
                        <span>{service.linkText}</span>
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  )}

                  {/* Download Link for Extension */}
                  {service.downloadLink && (
                    <div className="mt-6">
                      <a
                        href={service.downloadLink}
                        download="TrustGuard-Extension.zip"
                        className={`inline-flex items-center space-x-2 bg-gradient-to-r ${service.color} hover:opacity-90 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base`}
                      >
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        <span>{service.downloadText}</span>
                      </a>
                      <p className="mt-3 text-white/60 text-xs sm:text-sm">
                        💡 <strong>Installation:</strong> Extract the ZIP and
                        load it as an unpacked extension in Chrome/Edge/Brave.{' '}
                        <a
                          href="/downloads/INSTALLATION_GUIDE.md"
                          target="_blank"
                          className="text-purple-300 hover:text-purple-200 underline"
                        >
                          View detailed guide
                        </a>
                      </p>
                    </div>
                  )}
                </div>

                {/* Images */}
                <ServiceImageDisplay
                  images={service.images}
                  serviceTitle={service.title}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
            Ready to Get Started?
          </h3>
          <p className="text-white/70 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Choose any platform and start verifying information today. All
            services are integrated with our powerful AI engine.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <a
              href="/console"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-full font-bold shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              Try Console Now
            </a>
            <a
              href="/playground"
              className="backdrop-blur-lg bg-white/10 border-2 border-white/30 hover:bg-white/20 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-full font-bold transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              Explore Playground
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;
