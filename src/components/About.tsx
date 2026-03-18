const tags = [
  "Web 开发",
  "UI/UX 设计",
  "开源项目",
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
            关于我
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 tracking-tight">
            了解我
          </h2>
        </div>

        <div className="space-y-6 text-muted leading-relaxed text-base md:text-lg">
          <p>
            你好！我是肖峻铭，一名热爱 Web 开发的开发者。我喜欢将复杂的问题转化为简洁、美观且直观的解决方案。
          </p>
          <p>
            拥有计算机科学背景和对设计的热情，我致力于打造兼具功能性与美感的产品体验。工作之余，我喜欢探索新技术、关注设计趋势，或者享受一杯好咖啡。
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
