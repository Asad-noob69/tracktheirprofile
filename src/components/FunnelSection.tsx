"use client";

import { useState } from "react";

const ACCENT = "#00ff9d";
const ACCENT_LIGHT = "rgba(0, 255, 157, 0.14)";
const CLIP = "polygon(0 0, 100% 0, 90% 100%, 10% 100%)";

interface Stage {
  title: string;
  description: string;
}

interface FunnelLevel {
  tag: string;
  stat: string;
  text: string;
  widthPct: number;
  py: number;
  px: number;
  statSize: number;
  textSize: number;
}

const journeyStages: Stage[] = [
  {
    title: "Topic & Brand Search",
    description:
      "Enter a topic keyword or Reddit author and our tool aggregates relevant public discussions from multiple sources into one view.",
  },
  {
    title: "Organized Discussion Feed",
    description:
      "Results are split into clean post and comment streams with subreddit context, sentiment signals, and timestamps for easy analysis.",
  },
  {
    title: "Analyze & Export",
    description:
      "Browse insights, jump to original Reddit threads, and export data as CSV for reports, presentations, or further analysis.",
  },
];

const closureStage: Stage = {
  title: "Make Data-Driven Decisions",
  description:
    "Use structured community data to inform your product roadmap, marketing strategy, or research — all from a single dashboard.",
};

const funnelLevels: FunnelLevel[] = [
  {
    tag: "Topics Researched",
    stat: "50,000+",
    text: "research queries completed",
    widthPct: 100,
    py: 28,
    px: 40,
    statSize: 18,
    textSize: 15,
  },
  {
    tag: "Discussions Analyzed",
    stat: "25,000+",
    text: "threads with structured data",
    widthPct: 82,
    py: 20,
    px: 32,
    statSize: 16,
    textSize: 13,
  },
  {
    tag: "Posts + Comments",
    stat: "1.2M+",
    text: "data points collected",
    widthPct: 66,
    py: 14,
    px: 24,
    statSize: 14,
    textSize: 12,
  },
  {
    tag: "Insights Delivered",
    stat: "Daily",
    text: "teams using research data",
    widthPct: 52,
    py: 11,
    px: 20,
    statSize: 13,
    textSize: 11,
  },
];

function ChevronRight({ active }: { active: boolean }) {
  return (
    <svg
      className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${active ? "rotate-90" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      style={{ color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.35)" }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function AccordionItem({
  stage,
  isActive,
  onClick,
  isLast,
}: {
  stage: Stage;
  isActive: boolean;
  onClick: () => void;
  isLast?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl p-4 text-left transition-colors md:p-4 ${
        isActive ? "bg-green-accent" : "bg-[#1c2536]"
      }`}
      style={{ marginBottom: isLast ? 0 : 8 }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-white sm:text-[15px]">{stage.title}</span>
        <ChevronRight active={isActive} />
      </div>
      <div
        className="grid transition-[grid-template-rows] duration-500 ease-out"
        style={{ gridTemplateRows: isActive ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="mt-2.5 text-sm leading-6 text-white/80">{stage.description}</p>
        </div>
      </div>
    </button>
  );
}

export default function FunnelSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="border-t border-card-border bg-[#0f1520] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-14">
          <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
            How Reddit Profile
            <br />
            <span className="text-green-accent">Tracking Works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
            TrackTheirProfile organizes public Reddit posts and comments into a
            structured profile view so you can inspect activity faster with less manual effort.
          </p>
        </div>

        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/5 bg-[#161d2b] p-4 sm:p-5">
              <p className="mb-4 text-xs leading-5 text-white/45 sm:text-sm">
                Our search tool handles the aggregation
              </p>
              {journeyStages.map((stage, i) => (
                <AccordionItem
                  key={stage.title}
                  stage={stage}
                  isActive={active === i}
                  onClick={() => setActive(i)}
                  isLast={i === journeyStages.length - 1}
                />
              ))}
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#161d2b] p-4 sm:p-5">
              <p className="mb-4 text-xs leading-5 text-white/45 sm:text-sm">Your role in the workflow</p>
              <AccordionItem
                stage={closureStage}
                isActive={active === journeyStages.length}
                onClick={() => setActive(journeyStages.length)}
                isLast
              />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-[460px]">
              <div className="flex flex-col items-center">
                {funnelLevels.map((level, i) => {
                  const isLevelActive = active === i;
                  return (
                    <div key={level.tag} className="flex w-full flex-col items-center">
                      {i > 0 && (
                        <div
                          className="my-0.5 h-0 w-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent transition-colors duration-300"
                          style={{
                            borderTopColor: active === i - 1 ? ACCENT : "#1c2536",
                          }}
                        />
                      )}

                      <div className="mb-1 rounded-lg border border-white/5 bg-[#1c2536] px-3 py-1">
                        <span className="text-[11px] font-semibold tracking-[0.3px] text-white/55">
                          {level.tag}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        className="cursor-pointer text-center transition-colors duration-300"
                        style={{
                          width: `${level.widthPct}%`,
                          clipPath: CLIP,
                          background: isLevelActive ? ACCENT : "#1c2536",
                          padding: `${level.py}px ${level.px}px`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: level.statSize,
                            lineHeight: 1.35,
                          }}
                          className="font-bold text-white"
                        >
                          {level.stat}
                        </p>
                        <p
                          style={{
                            fontSize: level.textSize,
                            color: isLevelActive ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.58)",
                            lineHeight: 1.5,
                          }}
                        >
                          {level.text}
                        </p>
                      </button>
                    </div>
                  );
                })}
              </div>
            
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
