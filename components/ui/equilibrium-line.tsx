"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function EquilibriumLine() {
  const { scrollYProgress } = useScroll();
  const dotLeft = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: 2,
          background: "var(--line)",
          zIndex: 200,
        }}
      >
        <motion.div
          style={{
            height: "100%",
            background: "var(--accent)",
            transformOrigin: "left",
            scaleX: scrollYProgress,
          }}
        />
      </div>
      <motion.div
        style={{
          position: "fixed",
          top: -3,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--fg)",
          boxShadow: "0 0 0 4px var(--bg)",
          zIndex: 201,
          left: dotLeft,
        }}
      />
    </>
  );
}
