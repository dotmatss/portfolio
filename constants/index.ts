export const ROUTES = {
  HOME: "/",
  ABOUT: "#about",
  EXPERTISE: "#expertise",
  PROJECTS: "#projects",
  WORKFLOWS: "#workflows",
  EXPERIENCE: "#experience",
  PHILOSOPHY: "#philosophy",
  CONTACT: "#contact",
} as const;

export const NAV_LINKS = [
  { href: ROUTES.ABOUT, label: "About" },
  { href: ROUTES.EXPERTISE, label: "Expertise" },
  { href: ROUTES.PROJECTS, label: "Projects" },
  { href: ROUTES.WORKFLOWS, label: "Workflows" },
  { href: ROUTES.EXPERIENCE, label: "Experience" },
  { href: ROUTES.PHILOSOPHY, label: "Philosophy" },
  { href: ROUTES.CONTACT, label: "Contact" },
] as const;
