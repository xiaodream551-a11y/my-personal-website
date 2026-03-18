const tags = [
  "Web Development",
  "UI/UX Design",
  "Open Source",
  "TypeScript",
  "React",
  "Next.js",
];

export default function About() {
  return (
    <section id="about" className="py-24 md:py-32 bg-surface">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12">
          <span className="text-accent font-display text-sm font-semibold tracking-widest uppercase">
            About Me
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 tracking-tight">
            Getting to know me
          </h2>
        </div>

        <div className="space-y-6 text-muted leading-relaxed text-base md:text-lg">
          <p>
            Hello! I&apos;m a developer who loves building things for the web. I
            enjoy turning complex problems into simple, beautiful, and intuitive
            solutions.
          </p>
          <p>
            With a background in computer science and a passion for design, I
            strive to create experiences that are both functional and visually
            appealing. When I&apos;m not coding, you can find me exploring new
            technologies, reading about design trends, or enjoying a good cup of
            coffee.
          </p>
        </div>

        {/* Interest tags */}
        <div className="mt-10 flex flex-wrap gap-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-1.5 text-sm font-medium text-accent bg-accent-light rounded-full border border-accent/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
