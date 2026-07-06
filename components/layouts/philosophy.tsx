"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Reveal from "@/components/ui/reveal";
import philosophyData from "@/data/philosophy.json";

export default function Philosophy() {
  const quoteRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: quoteRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [18, -18]);

  return (
    <section id="philosophy" className="section-line" style={{ textAlign: "center" }}>
      <Reveal>
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          Philosophy
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <div className="quote" ref={quoteRef}>
          <motion.span style={{ display: "inline-block", y }}>
            &ldquo;{philosophyData.quote}&rdquo;
          </motion.span>
        </div>
      </Reveal>
      <div className="principles">
        {philosophyData.principles.map((p, i) => (
          <Reveal key={p} delay={(i % 3) * 0.08} className="principle">
            <div className="pnum">{String(i + 1).padStart(2, "0")}</div>
            <p>{p}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
