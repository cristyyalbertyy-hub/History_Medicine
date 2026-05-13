import { useCallback, useEffect, useState } from "react";
import type { Branch, LeafTopic } from "./curriculum";
import { branches } from "./curriculum";
import { answersRoughlyMatch, parseQuizCsv, type QuizRow } from "./parseQuizCsv";

type Tab = "video" | "podcast" | "infographic" | "questionnaire";

function TopicModal({
  branchTitle,
  topic,
  onClose,
}: {
  branchTitle: string;
  topic: LeafTopic;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("video");
  const assets = topic.assets;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!assets) setTab("video");
  }, [assets, topic.id]);

  return (
    <div
      className="backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="topic-modal-title"
      >
        <div className="modal-head">
          <h2 id="topic-modal-title">{topic.title}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p style={{ margin: "0 1rem 0.5rem", fontSize: "0.8rem", color: "var(--muted)" }}>
          {branchTitle}
        </p>
        <div className="tabs" role="tablist">
          {(
            [
              ["video", "Video"],
              ["podcast", "Podcast"],
              ["infographic", "Infographic"],
              ["questionnaire", "Quiz"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className="tab"
              disabled={!assets}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="modal-body">
          {!assets ? (
            <div className="placeholder-block">
              Media for this topic is not available yet. When video, podcast, infographic, and quiz
              CSV files are added, they will appear here.
            </div>
          ) : tab === "video" ? (
            <div className="media-wrap">
              <video controls playsInline preload="metadata" src={assets.video}>
                Your browser does not support HTML5 video.
              </video>
            </div>
          ) : tab === "podcast" ? (
            <div
              className="media-wrap"
              style={{ padding: "0.75rem", background: "var(--bg-elevated)" }}
            >
              <audio controls preload="metadata" src={assets.podcast}>
                Your browser does not support HTML5 audio.
              </audio>
            </div>
          ) : tab === "infographic" ? (
            <div className="media-wrap" style={{ background: "var(--bg-elevated)" }}>
              <img
                className="infographic"
                src={assets.infographic}
                alt={`Infographic: ${topic.title}`}
              />
            </div>
          ) : (
            <QuestionnaireTab url={assets.questionnaire} />
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionnaireTab({ url }: { url: string }) {
  const [rows, setRows] = useState<QuizRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<"idle" | "ok" | "bad">("idle");

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setErr(null);
    setIndex(0);
    setInput("");
    setChecked("idle");
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        const parsed = parseQuizCsv(text);
        if (!parsed.length) throw new Error("Empty or invalid CSV");
        setRows(parsed);
      })
      .catch(() => {
        if (!cancelled) setErr("Could not load the questionnaire.");
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const row = rows?.[index];
  const total = rows?.length ?? 0;

  const verify = useCallback(() => {
    if (!row) return;
    const ok = answersRoughlyMatch(row.answer, input);
    setChecked(ok ? "ok" : "bad");
  }, [row, input]);

  const next = useCallback(() => {
    if (!rows?.length) return;
    setIndex((i) => (i + 1) % rows.length);
    setInput("");
    setChecked("idle");
  }, [rows]);

  if (err) return <p className="error-text">{err}</p>;
  if (!rows) return <p className="loading">Loading questions…</p>;
  if (!row) return <p className="error-text">No questions available.</p>;

  return (
    <div>
      <div className="quiz-meta">
        Question {index + 1} of {total}
      </div>
      <p className="quiz-q">{row.question}</p>
      <input
        className="quiz-input"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setChecked("idle");
        }}
        placeholder="Your answer"
        aria-label="Your answer"
        onKeyDown={(e) => {
          if (e.key === "Enter") verify();
        }}
      />
      <div className="quiz-actions">
        <button type="button" className="btn btn-primary" onClick={verify} disabled={!input.trim()}>
          Check
        </button>
        <button type="button" className="btn btn-ghost" onClick={next}>
          Next
        </button>
      </div>
      {checked === "ok" && <div className="feedback ok">Correct.</div>}
      {checked === "bad" && (
        <div className="feedback bad">That does not match the expected answer yet.</div>
      )}
      {(checked === "bad" || checked === "ok") && (
        <div className="answer-reveal">
          <strong>Reference answer:</strong> {row.answer}
        </div>
      )}
    </div>
  );
}

function BranchAccordion({
  branch,
  isOpen,
  onToggle,
  onPickTopic,
}: {
  branch: Branch;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onPickTopic: (branchTitle: string, topic: LeafTopic) => void;
}) {
  return (
    <div className="accordion-branch">
      <button
        type="button"
        className="branch-trigger"
        aria-expanded={isOpen}
        onClick={() => onToggle(branch.id)}
      >
        {branch.title}
      </button>
      {isOpen && (
        <div className="branch-topics">
          {branch.topics.map((t) => (
            <button
              key={t.id}
              type="button"
              className="topic-btn"
              onClick={() => onPickTopic(branch.title, t)}
            >
              {t.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [expandedBranchId, setExpandedBranchId] = useState<string>(branches[0]?.id ?? "");
  const [open, setOpen] = useState<{ branchTitle: string; topic: LeafTopic } | null>(null);

  const toggleBranch = (id: string) => {
    setExpandedBranchId((cur) => (cur === id ? "" : id));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>History of Medicine</h1>
        <p>
          Study map in accordion form — open a topic for video, podcast, infographic, and quiz.
        </p>
      </header>

      <div className="accordion">
        {branches.map((b) => (
          <BranchAccordion
            key={b.id}
            branch={b}
            isOpen={expandedBranchId === b.id}
            onToggle={toggleBranch}
            onPickTopic={(branchTitle, topic) => setOpen({ branchTitle, topic })}
          />
        ))}
      </div>

      {open && (
        <TopicModal
          branchTitle={open.branchTitle}
          topic={open.topic}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
