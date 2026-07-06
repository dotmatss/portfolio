import Header from "@/components/layouts/header";
import Hero from "@/components/layouts/hero";
import About from "@/components/layouts/about";
import Expertise from "@/components/layouts/expertise";
import Projects from "@/components/layouts/projects";
import WorkflowVisual from "@/components/layouts/workflow-visual";
import Experience from "@/components/layouts/experience";
import Stack from "@/components/layouts/stack";
import Philosophy from "@/components/layouts/philosophy";
import Contact from "@/components/layouts/contact";
import Footer from "@/components/layouts/footer";
import EquilibriumLine from "@/components/ui/equilibrium-line";
import ChatWidget from "@/components/common/chat-widget";

export default function Home() {
  return (
    <>
      <EquilibriumLine />
      <Header />
      <Hero />
      <About />
      <Expertise />
      <Projects />
      <WorkflowVisual />
      <Experience />
      <Stack />
      <Philosophy />
      <Contact />
      <Footer />
      <ChatWidget />
    </>
  );
}
