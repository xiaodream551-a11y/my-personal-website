export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-white to-slate-50" />

      {/* Decorative blurs */}
      <div className="absolute top-20 right-[15%] w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-[10%] w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid" />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Avatar placeholder */}
        <div className="animate-fade-in-up mx-auto mb-8 w-28 h-28 rounded-full bg-gradient-to-br from-accent to-cyan-400 p-[3px]">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <svg
              className="w-12 h-12 text-accent/40"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .7.5 1.2 1.2 1.2h16.8c.7 0 1.2-.5 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        </div>

        {/* Name */}
        <h1 className="animate-fade-in-up delay-100 font-display text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-4">
          肖峻铭
        </h1>

        {/* Tagline */}
        <p className="animate-fade-in-up delay-200 text-lg md:text-xl text-muted max-w-lg mx-auto mb-10 leading-relaxed">
          热爱编程的开发者，用简洁的代码与创造性思维，打造优雅的数字体验。
        </p>

        {/* CTA Button */}
        <div className="animate-fade-in-up delay-300">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium px-7 py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5"
          >
            联系我
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
