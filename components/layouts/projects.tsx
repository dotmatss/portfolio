"use client";

import Reveal from "@/components/ui/reveal";
import projectsData from "@/data/projects.json";

export default function Projects() {
  return (
    <section id="projects" className="section-line">
      <div className="section-head">
        <Reveal>
          <div className="eyebrow">Selected Work</div>
        </Reveal>
        <Reveal delay={0.08}>
          <h2>Recent projects.</h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p>
            A few systems I&apos;ve designed and shipped. Replace these with your
            own case studies — details, links, and metrics.
          </p>
        </Reveal>
      </div>

      {projectsData.map((p) => (
        <Reveal key={p.index} className="project-card">
          <div>
            <span className="p-index">{p.index}</span>
            <h3>{p.title}</h3>
            <div className="stack-pills">
              {p.stack.map((s) => (
                <span className="pill" key={s}>
                  {s}
                </span>
              ))}
            </div>
            <div className="p-links">
              <a href={p.demoUrl}>Live demo</a>
              <a href={p.githubUrl}>GitHub</a>
            </div>
          </div>
          <div>
            <p className="p-desc">{p.desc}</p>
            <div className="p-impact">
              <span className="label">{p.impactLabel}</span>
              <div className="val">{p.impact}</div>
            </div>
          </div>
        </Reveal>
      ))}
    </section>
  );
}
