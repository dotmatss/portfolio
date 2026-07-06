"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Reveal from "@/components/ui/reveal";
import profilePhoto from "@/public/profile.jpg";
import heroData from "@/data/hero.json";

function ParallaxShapes() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, (v) => (shouldReduceMotion ? 0 : v * 0.25));
  const y2 = useTransform(scrollY, (v) => (shouldReduceMotion ? 0 : v * 0.4));
  const y3 = useTransform(scrollY, (v) => (shouldReduceMotion ? 0 : v * 0.15));
  const y4 = useTransform(scrollY, (v) => (shouldReduceMotion ? 0 : v * 0.3));
  const y5 = useTransform(scrollY, (v) => (shouldReduceMotion ? 0 : v * 0.2));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <motion.svg
        style={{ position: "absolute", top: "12%", left: "8%", width: 70, height: 70, y: y1 }}
        viewBox="0 0 70 70"
      >
        <circle cx="35" cy="35" r="34" fill="none" stroke="var(--line-strong)" strokeWidth="1" />
      </motion.svg>
      <motion.svg
        style={{ position: "absolute", top: "68%", left: "4%", width: 40, height: 40, y: y2 }}
        viewBox="0 0 40 40"
      >
        <rect x="1" y="1" width="38" height="38" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
      </motion.svg>
      <motion.svg
        style={{ position: "absolute", top: "20%", left: "46%", width: 120, height: 1, y: y3 }}
        viewBox="0 0 120 1"
      >
        <line x1="0" y1="0.5" x2="120" y2="0.5" stroke="var(--line-strong)" strokeWidth="1" />
      </motion.svg>
      <motion.svg
        style={{ position: "absolute", top: "78%", left: "58%", width: 56, height: 56, y: y4 }}
        viewBox="0 0 56 56"
      >
        <circle cx="28" cy="28" r="27" fill="none" stroke="var(--line-strong)" strokeWidth="1" />
        <circle cx="28" cy="28" r="3" fill="var(--accent)" />
      </motion.svg>
      <motion.svg
        style={{ position: "absolute", top: "8%", left: "82%", width: 1, height: 90, y: y5 }}
        viewBox="0 0 1 90"
      >
        <line x1="0.5" y1="0" x2="0.5" y2="90" stroke="var(--line-strong)" strokeWidth="1" />
      </motion.svg>
    </div>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: portraitRef,
    offset: ["start end", "end start"],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [30, -30]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    heroRef.current?.style.setProperty("--mx", `${x}%`);
    heroRef.current?.style.setProperty("--my", `${y}%`);
  }

  return (
    <section id="hero" ref={heroRef} onMouseMove={handleMouseMove}>
      <div className="bg-gradient" />
      <ParallaxShapes />
      <div className="hero-grid">
        <div>
          <Reveal>
            <div className="eyebrow">{heroData.eyebrow}</div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="headline">
              {heroData.headline}
              <br />
              <em>{heroData.headlineEm}</em>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="hero-sub">{heroData.subtitle}</p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="cta-row">
              <a href={heroData.ctaPrimary.href} className="btn btn-solid">
                {heroData.ctaPrimary.label}
              </a>
              <a href={heroData.ctaSecondary.href} className="btn btn-ghost">
                {heroData.ctaSecondary.label}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.16} className="portrait-wrap">
          <motion.div ref={portraitRef} style={{ y: portraitY }}>
            <div className="portrait-frame">
              <div className="corner tl" />
              <div className="corner br" />
              <Image src={profilePhoto} alt="Portrait" priority />
            </div>
            <div className="portrait-tag">{heroData.portraitTag}</div>
          </motion.div>
        </Reveal>
      </div>
      <div className="scroll-cue">
        <span>SCROLL</span>
        <span className="line" />
      </div>
    </section>
  );
}
