"use client";

import Reveal from "@/components/ui/reveal";
import stackData from "@/data/stack.json";

export default function Stack() {
  return (
    <section id="stack" className="section-line">
      <div className="section-head">
        <Reveal>
          <div className="eyebrow">Stack</div>
        </Reveal>
        <Reveal delay={0.08}>
          <h2>Tools of the craft.</h2>
        </Reveal>
      </div>
      <div className="stack-groups">
        {stackData.map((g, i) => (
          <Reveal key={g.name} delay={(i % 3) * 0.08} className="stack-group">
            <h4>{g.name}</h4>
            <ul>
              {g.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
