const tags = [
  "智能建造",
  "人工智能",
  "BIM",
  "Python",
  "Unity3D",
  "深度学习",
  "数据分析",
  "英语能力",
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
            你好！我是肖峻铭，南京工业大学智能建造专业本科生。我对人工智能与建筑工程的交叉领域充满热情，致力于探索如何用智能化手段提升建造效率与工程质量。曾获全国大学生智能建造竞赛一等奖。
          </p>
          <p>
            专业技能方面，我持有中国图学会 BIM 一级与二级（建筑设计）证书，在成图技术大赛中获全国及省级奖项，并参与开发了基于 Unity3D 的数字城隧交互平台（已获软件著作权）。我熟悉 Python 编程、深度学习与数据分析，善于将 AI 技术与工程实践相结合。
          </p>
          <p>
            此外，我注重英语综合能力的培养，在 LSCAT 江苏省笔译大赛、全国大学生英语作文大赛等竞赛中均取得佳绩。未来，我希望在 AI 与建筑/土木工程的交叉领域深入研究，为智能建造行业的发展贡献力量。
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
