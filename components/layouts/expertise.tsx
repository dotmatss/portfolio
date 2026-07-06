"use client";

import Reveal from "@/components/ui/reveal";
import expertiseData from "@/data/expertise.json";

export default function Expertise() {
  return (
    <section id="expertise" className="section-line">
      <div className="section-head">
        <Reveal>
          <div className="eyebrow">Expertise</div>
        </Reveal>
        <Reveal delay={0.08}>
          <h2>Where I focus.</h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p>A concentrated set of disciplines, not a scattered list of buzzwords.</p>
        </Reveal>
      </div>
      <div className="expertise-grid">
        {expertiseData.map((item, i) => (
          <Reveal key={item.title} delay={(i % 3) * 0.08} className="expertise-card">
            <span className="tag">{item.tag}</span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
