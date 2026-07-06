"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Reveal from "@/components/ui/reveal";
import projectsData from "@/data/projects.json";

interface ProjectImage {
  src: string;
  alt: string;
}

interface Project {
  index: string;
  title: string;
  stack: string[];
  desc: string;
  impactLabel: string;
  impact: string;
  images: ProjectImage[];
  demoUrl: string;
  githubUrl: string;
  year: string;
}

function ImageGallery({ images }: { images: ProjectImage[] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const closeLightbox = useCallback(() => setLightbox(false), []);

  useEffect(() => {
    if (!lightbox) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, closeLightbox]);

  function prev(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <>
      <div className="project-gallery">
        <div className="gallery-image-wrap" onClick={() => setLightbox(true)}>
          <Image
            src={images[current].src}
            alt={images[current].alt}
            width={800}
            height={450}
            className="gallery-image"
            priority
          />
          <div className="gallery-expand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button className="gallery-nav gallery-prev" onClick={prev} aria-label="Previous image">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="gallery-nav gallery-next" onClick={next} aria-label="Next image">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <div className="gallery-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`gallery-dot ${i === current ? "active" : ""}`}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightbox &&
        createPortal(
          <div className="lightbox-overlay" onClick={closeLightbox}>
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close lightbox">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <Image
              src={images[current].src}
              alt={images[current].alt}
              width={1200}
              height={675}
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </>
  );
}

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

      {projectsData.map((p) => {
        const project = p as Project;
        return (
          <Reveal key={project.index} className="project-card">
            <div>
              <ImageGallery images={project.images} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="p-index">{project.index}</span>
                <span className="font-mono text-[11px] text-muted">{project.year}</span>
              </div>
              <h3>{project.title}</h3>
              <div className="stack-pills">
                {project.stack.map((s) => (
                  <span className="pill" key={s}>
                    {s}
                  </span>
                ))}
              </div>
              <p className="p-desc">{project.desc}</p>
              <div className="p-impact">
                <span className="label">{project.impactLabel}</span>
                <div className="val">{project.impact}</div>
              </div>
              <div className="p-links">
                <a href={project.demoUrl}>Live demo</a>
                <a href={project.githubUrl}>GitHub</a>
              </div>
            </div>
          </Reveal>
        );
      })}
    </section>
  );
}
