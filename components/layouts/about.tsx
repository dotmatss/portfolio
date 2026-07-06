"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Reveal from "@/components/ui/reveal";
import aboutData from "@/data/about.json";

export default function About() {
  const numRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: numRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [24, -24]);

  return (
    <section id="about" className="section-line">
      <div className="about-grid">
        <div className="about-num" ref={numRef}>
          <motion.span style={{ display: "inline-block", y }}>01</motion.span>
        </div>
        <div className="about-body">
          <Reveal>
            <div className="eyebrow">{aboutData.eyebrow}</div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2
              style={{
                fontSize: "clamp(26px, 3vw, 38px)",
                fontWeight: 700,
                margin: "16px 0 30px",
                letterSpacing: "-0.01em",
              }}
            >
              {aboutData.heading}
            </h2>
          </Reveal>
          {aboutData.paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.16 + i * 0.08}>
              <p dangerouslySetInnerHTML={{ __html: p }} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
