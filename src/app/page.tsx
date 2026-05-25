import {
  LandingAdvantages,
  LandingDifferentiators,
  LandingMoat,
} from "@/components/landing-content";
import { LandingCourseMapDemo } from "@/components/landing-course-map-demo";
import { LandingHeader, LandingHero } from "@/components/landing-hero";

export default function Home() {
  return (
    <div className="mesh-gradient min-h-dvh">
      <LandingHeader />
      <LandingHero />
      <LandingCourseMapDemo />
      <LandingAdvantages />
      <LandingMoat />
      <LandingDifferentiators />

      <footer className="glass-soft mx-4 mb-6 rounded-3xl px-4 py-6 text-center text-sm font-semibold text-muted-foreground sm:mx-6">
        <p>
          CourseMap — structured understanding from chaotic materials. Built
          for students who want clarity, not another app to manage.
        </p>
      </footer>
    </div>
  );
}
