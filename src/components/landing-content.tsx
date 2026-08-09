import Link from "next/link";
import {
  Compass,
  Layers,
  Map,
  Shield,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const advantages = [
  {
    icon: Zap,
    title: "Instant clarity",
    description:
      "Turn walls of messy notes, slide dumps, and readings into a single navigable course map in one step — no manual outlining.",
  },
  {
    icon: Layers,
    title: "Hierarchy that sticks",
    description:
      "Concepts are organized from big ideas down to subtopics, so you see how everything connects instead of scrolling endless paragraphs.",
  },
  {
    icon: Compass,
    title: "Built for learning",
    description:
      "Your notes stay intact. The map is how you navigate them — topic by topic — instead of scrolling a giant dump.",
  },
  {
    icon: Target,
    title: "Simplified explanations",
    description:
      "Chat with your notes: extract a formula, jump to a topic, or ask the assistant to rewrite or elaborate without losing what you wrote.",
  },
];

const moatPoints = [
  {
    title: "Purpose-built transformation",
    body: "CourseMap digitizes your real notes, organizes them into a map, and gives you an assistant that only knows YOUR notebook — not a generic chatbot.",
  },
  {
    title: "Concept-first architecture",
    body: "Our pipeline extracts, ranks, and nests concepts into a hierarchy tuned for how students actually learn — not flat summaries or bullet dumps.",
  },
  {
    title: "Clarity as the product",
    body: "The map is navigation. The notes are the product. Click a topic to read what you actually wrote, then ask the assistant to find or expand it.",
  },
  {
    title: "Perceived intelligence, real structure",
    body: "The wow moment comes from seeing your own messy input reorganized into something that finally makes sense — backed by consistent JSON schema and reliable structured AI output.",
  },
];

const notThis = [
  "Not a summary that throws away your real notes",
  "Not a generic chatbot that doesn't know your class",
  "Not flashcards or spaced-repetition gamification",
  "Not a social study platform",
];

export function LandingAdvantages() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="glass-strong mx-auto max-w-2xl rounded-3xl px-6 py-6 text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Why CourseMap
        </p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          Study smarter when the course finally has a shape
        </h2>
        <p className="mt-3 text-base font-medium leading-relaxed text-muted-foreground">
          Most tools either dump your notes in a folder or summarize them away.
          CourseMap keeps every detail, rebuilds the structure, and lets you
          walk the map and talk to your notes.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {advantages.map((item) => (
          <div
            key={item.title}
            className="glass-strong flex flex-col gap-4 rounded-3xl p-6 sm:p-7"
          >
            <div className="glass-pill flex h-12 w-12 items-center justify-center rounded-2xl text-primary">
              <item.icon className="h-6 w-6" strokeWidth={2.25} />
            </div>
            <h3 className="text-lg font-extrabold">{item.title}</h3>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LandingMoat() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
        <div>
          <p className="glass-pill inline-flex rounded-full px-4 py-1.5 text-sm font-bold text-primary">
            Our moat
          </p>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
            Why CourseMap wins where generic AI tools don&apos;t
          </h2>
          <p className="mt-5 text-base font-medium leading-relaxed text-muted-foreground">
            Anyone can paste text into a chatbot. CourseMap is built around a
            single, defensible workflow: ingest messy academic input, extract
            the conceptual skeleton of the course, and deliver a polished map
            students can navigate immediately.
          </p>
          <p className="mt-4 text-base font-medium leading-relaxed text-muted-foreground">
            That narrow focus — structure over conversation, maps over messages
            — is our competitive edge. The more materials you run through it,
            the more obvious the gap becomes between &ldquo;AI summarized my
            notes&rdquo; and &ldquo;I finally understand this class.&rdquo;
          </p>

          <Link
            href="/generate"
            className="glass-button mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-8 text-sm font-bold text-primary-foreground transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            See it with your materials
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {moatPoints.map((point) => (
            <div
              key={point.title}
              className="glass-strong rounded-3xl p-6 sm:p-7"
            >
              <div className="mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="font-extrabold">{point.title}</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingDifferentiators() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
      <div className="glass-strong overflow-hidden rounded-3xl">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="border-b border-white/60 p-8 sm:p-10 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <Map className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-extrabold sm:text-2xl">
                What you get with CourseMap
              </h2>
            </div>
            <ul className="mt-6 space-y-4">
              {[
                "A course title and overview inferred from your materials",
                "Major concepts ordered in a logical learning path",
                "Plain-language summaries for each topic",
                "Subconcepts broken out as scannable takeaways",
                "A sidebar map you can click through while studying",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm font-semibold text-foreground/90"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/70" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-soft p-8 sm:p-10">
            <h3 className="text-lg font-extrabold text-muted-foreground">
              What we are not building
            </h3>
            <ul className="mt-5 space-y-3">
              {notThis.map((item) => (
                <li
                  key={item}
                  className="text-sm font-semibold text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm font-medium leading-relaxed text-muted-foreground">
              We obsess over one outcome: you upload chaos, you leave with a
              course that feels teachable. That focus is the product — and the
              reason students keep coming back.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooterCta() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-16">
      <div className="glass-strong rounded-3xl px-6 py-10 sm:px-10 sm:py-12">
        <h2 className="text-2xl font-extrabold sm:text-3xl">
          Ready to make sense of your semester?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base font-medium text-muted-foreground">
          Upload your materials once. Walk away with a course map that looks
          like someone organized the entire class for you.
        </p>
        <Link
          href="/generate"
          className="glass-button mt-8 inline-flex h-14 items-center justify-center rounded-3xl px-10 text-base font-bold text-primary-foreground transition-all hover:brightness-105 active:scale-[0.98]"
        >
          Generate FREE course map
        </Link>
      </div>
    </section>
  );
}
