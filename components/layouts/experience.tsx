"use client";

import Reveal from "@/components/ui/reveal";
import experienceData from "@/data/experience.json";

export default function Experience() {
  return (
    <section id="experience" className="section-line">
      <div className="section-head">
        <Reveal>
          <div className="eyebrow">Experience</div>
        </Reveal>
        <Reveal delay={0.08}>
          <h2>How I got here.</h2>
        </Reveal>
      </div>
      <div className="timeline">
        {experienceData.map((r, i) => (
          <Reveal key={r.title} delay={i * 0.08} className="t-item">
            <span className="t-date">{r.date}</span>
            <h4>{r.title}</h4>
            <p>{r.desc}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
