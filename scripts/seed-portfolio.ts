import * as fs from "fs";
import * as path from "path";
import { ragService } from "../server/services/rag.service";

const DATA_DIR = path.join(__dirname, "..", "data");

interface Project {
  index: string;
  title: string;
  stack: string[];
  desc: string;
  year: string;
}

interface Experience {
  date: string;
  title: string;
  desc: string;
}

interface StackCategory {
  name: string;
  items: string[];
}

interface Expertise {
  tag: string;
  title: string;
  desc: string;
}

interface About {
  paragraphs: string[];
}

interface Philosophy {
  quote: string;
  principles: string[];
}

function loadJson<T>(filename: string): T {
  const raw = fs.readFileSync(path.join(DATA_DIR, filename), "utf-8");
  return JSON.parse(raw);
}

async function seed() {
  console.log("Starting RAG seed...\n");

  const docs: { source: string; content: string; metadata: Record<string, unknown> }[] = [];

  const projects = loadJson<Project[]>("projects.json");
  for (const p of projects) {
    docs.push({
      source: `project:${p.title}`,
      content: `Project: ${p.title} (${p.year})\nStack: ${p.stack.join(", ")}\nDescription: ${p.desc}`,
      metadata: { type: "project", title: p.title, year: p.year },
    });
  }
  console.log(`  Loaded ${projects.length} projects`);

  const experience = loadJson<Experience[]>("experience.json");
  for (const e of experience) {
    docs.push({
      source: `experience:${e.title}`,
      content: `Experience: ${e.title}\nPeriod: ${e.date}\nDescription: ${e.desc}`,
      metadata: { type: "experience", title: e.title },
    });
  }
  console.log(`  Loaded ${experience.length} experiences`);

  const stack = loadJson<StackCategory[]>("stack.json");
  for (const cat of stack) {
    docs.push({
      source: `stack:${cat.name}`,
      content: `Tech Stack - ${cat.name}: ${cat.items.join(", ")}`,
      metadata: { type: "stack", category: cat.name },
    });
  }
  console.log(`  Loaded ${stack.length} stack categories`);

  const expertise = loadJson<Expertise[]>("expertise.json");
  for (const e of expertise) {
    docs.push({
      source: `expertise:${e.title}`,
      content: `Expertise: ${e.title} (${e.tag})\n${e.desc}`,
      metadata: { type: "expertise", tag: e.tag, title: e.title },
    });
  }
  console.log(`  Loaded ${expertise.length} expertise items`);

  const about = loadJson<About>("about.json");
  docs.push({
    source: "about",
    content: `About Jefferson:\n${about.paragraphs.join("\n\n")}`,
    metadata: { type: "about" },
  });
  console.log(`  Loaded about section`);

  const philosophy = loadJson<Philosophy>("philosophy.json");
  docs.push({
    source: "philosophy",
    content: `Philosophy:\nQuote: ${philosophy.quote}\n\nPrinciples:\n${philosophy.principles.map((p, i) => `${i + 1}. ${p}`).join("\n")}`,
    metadata: { type: "philosophy" },
  });
  console.log(`  Loaded philosophy section`);

  console.log(`\nIngesting ${docs.length} documents into pgvector...`);
  const chunks = await ragService.ingestDocuments(docs);
  console.log(`Ingested ${chunks} chunks successfully.`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
