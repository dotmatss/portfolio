"use client";

import Reveal from "@/components/ui/reveal";
import contactData from "@/data/contact.json";

export default function Contact() {
  return (
    <section id="contact" className="section-line" style={{ textAlign: "center" }}>
      <Reveal>
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          {contactData.eyebrow}
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2>
          {contactData.heading.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i === 0 && <br />}
            </span>
          ))}
        </h2>
      </Reveal>
      <Reveal delay={0.16}>
        <p>{contactData.description}</p>
      </Reveal>
      <Reveal delay={0.24}>
        <div className="cta-row" style={{ justifyContent: "center" }}>
          <a href={`mailto:${contactData.email}`} className="btn btn-solid">
            {contactData.emailLabel}
          </a>
        </div>
      </Reveal>
      <Reveal delay={0.32}>
        <div className="contact-links">
          {contactData.links.map((l) => (
            <a key={l.label} href={l.url}>{l.label}</a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
