import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Branch, LeafTopic } from "./curriculum";
import { branches, courseTitle } from "./curriculum";
import { parseQuizCsv, type QuizRow } from "./parseQuizCsv";
import { publicAsset } from "./publicAsset";
import { useAuth } from "./context/AuthContext";

type Tab = "video" | "podcast" | "infographic" | "questions";

type Selection = {
  branchId: string;
  topicId: string;
};

function collapsedRecord(ids: string[]): Record<string, boolean> {
  const init: Record<string, boolean> = {};
  for (const id of ids) init[id] = false;
  return init;
}

function QuestionnaireTab({ url }: { url: string }) {
  const [items, setItems] = useState<QuizRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(null);
    setIndex(0);
    setRevealed(false);

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        const parsed = parseQuizCsv(text);
        if (!parsed.length) throw new Error("Empty or invalid CSV");
        setItems(parsed);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the questionnaire.");
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) return <p className="muted">{error}</p>;
  if (!items) return <p className="muted">Loading questions…</p>;
  if (items.length === 0) return <p className="muted">No questions in this file.</p>;

  const card = items[index]!;
  const atStart = index === 0;
  const atEnd = index >= items.length - 1;

  const goPrevious = () => {
    if (atStart) return;
    setIndex((i) => i - 1);
    setRevealed(false);
  };

  const goNext = () => {
    if (atEnd) return;
    setIndex((i) => i + 1);
    setRevealed(false);
  };

  return (
    <div className="questionnaire">
      <p className="questionnaire__progress">
        Question {index + 1} of {items.length}
      </p>

      <div className="questionnaire__nav-row">
        <button
          type="button"
          className="questionnaire__arrow"
          onClick={goPrevious}
          disabled={atStart}
          aria-label="Previous question"
        >
          ←
        </button>

        <div className="questionnaire__card">
          <p className="questionnaire__question">{card.question}</p>
          {revealed ? (
            <div className="questionnaire__answer">
              <span className="questionnaire__answer-label">Answer</span>
              <p>{card.answer}</p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="questionnaire__arrow"
          onClick={goNext}
          disabled={atEnd}
          aria-label="Next question"
        >
          →
        </button>
      </div>

      {!revealed ? (
        <button type="button" className="questionnaire__reveal" onClick={() => setRevealed(true)}>
          Show answer
        </button>
      ) : null}
    </div>
  );
}

function BranchAccordion({
  branch,
  isOpen,
  selectedTopicId,
  onToggle,
  onPickTopic,
}: {
  branch: Branch;
  isOpen: boolean;
  selectedTopicId: string | null;
  onToggle: (id: string) => void;
  onPickTopic: (branchId: string, topic: LeafTopic) => void;
}) {
  return (
    <div className="accordion accordion--branch" data-branch={branch.id}>
      <button
        type="button"
        className="accordion-trigger accordion-trigger--branch"
        style={{ backgroundColor: branch.color }}
        aria-expanded={isOpen}
        onClick={() => onToggle(branch.id)}
      >
        <span className="chevron" aria-hidden>
          {isOpen ? "▾" : "▸"}
        </span>
        <span className="branch-name">{branch.title}</span>
      </button>
      {isOpen ? (
        <ul className="branch-topics">
          {branch.topics.map((topic) => (
            <li key={topic.id}>
              <button
                type="button"
                className={`lesson-card${selectedTopicId === topic.id ? " active" : ""}`}
                onClick={() => onPickTopic(branch.id, topic)}
              >
                <span className="lesson-card-title">{topic.title}</span>
                <span className="lesson-card-arrow" aria-hidden>
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function TopicContent({
  branchTitle,
  topic,
  tab,
  onTabChange,
}: {
  branchTitle: string;
  topic: LeafTopic;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const assets = topic.assets;

  useEffect(() => {
    if (!assets) onTabChange("video");
  }, [assets, topic.id, onTabChange]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "video", label: "Video" },
    { id: "podcast", label: "Podcast" },
    { id: "infographic", label: "Infographic" },
    { id: "questions", label: "Questions" },
  ];

  return (
    <div className="lesson-view">
      <header className="subchapter-head">
        <p className="eyebrow">{branchTitle}</p>
        <h2>{topic.title}</h2>
      </header>

      <div className="media-tabs" role="tablist" aria-label="Lesson media">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            className={`media-tab${tab === id ? " active" : ""}`}
            disabled={!assets}
            onClick={() => onTabChange(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="media-stage"
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        onContextMenu={(event) => event.preventDefault()}
      >
        {!assets ? (
          <div className="media-stage--placeholder">
            <p>
              Media for this topic is not available yet. When video, podcast, infographic, and quiz
              files are added, they will appear here.
            </p>
          </div>
        ) : tab === "video" ? (
          <div className="media-panel">
            <video
              className="video"
              controls
              controlsList="nodownload"
              playsInline
              preload="metadata"
              src={assets.video}
            >
              Your browser does not support HTML5 video.
            </video>
          </div>
        ) : tab === "podcast" ? (
          <div className="media-panel">
            <audio className="audio" controls controlsList="nodownload" preload="metadata" src={assets.podcast}>
              Your browser does not support HTML5 audio.
            </audio>
          </div>
        ) : tab === "infographic" ? (
          <div className="media-panel">
            <img
              className="infographic"
              src={assets.infographic}
              alt={`Infographic: ${topic.title}`}
            />
          </div>
        ) : (
          <div className="media-panel media-panel--questions">
            <QuestionnaireTab url={assets.questionnaire} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { userEmail, logout } = useAuth();
  const [openBranches, setOpenBranches] = useState(() =>
    collapsedRecord(branches.map((b) => b.id)),
  );
  const [selection, setSelection] = useState<Selection | null>(null);
  const [atHome, setAtHome] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const [tab, setTab] = useState<Tab>("video");
  const mainRef = useRef<HTMLElement>(null);

  const selectedBranch = useMemo(
    () => (selection ? branches.find((b) => b.id === selection.branchId) : null),
    [selection],
  );
  const selectedTopic = useMemo(
    () => selectedBranch?.topics.find((t) => t.id === selection?.topicId) ?? null,
    [selectedBranch, selection],
  );

  const activeBranchId = useMemo(() => {
    if (selectedBranch) return selectedBranch.id;
    return branches.find((b) => openBranches[b.id])?.id ?? null;
  }, [selectedBranch, openBranches]);

  const mobileLessonContext = useMemo(() => {
    if (!selectedBranch || !selectedTopic) return null;
    return {
      chapter: selectedBranch.title,
      subchapter: selectedTopic.title,
      color: selectedBranch.color,
    };
  }, [selectedBranch, selectedTopic]);

  const showMobileLessonBar = !mobileMenuOpen && !atHome && mobileLessonContext !== null;
  const shellMode = mobileMenuOpen ? "is-mobile-menu" : "is-mobile-content";

  const overviewImage = publicAsset("/AF_MAG_I.png");

  const overviewPanel = (
    <div className="overview-panel">
      <div className="overview-intro">
        <p className="overview-lead">
          Ancient foundations, scientific advancement, and public health — three eras with video,
          podcast, infographic and quiz for each topic.
        </p>
        <ul className="overview-branches" aria-label="Course branches">
          {branches.map((branch) => (
            <li
              key={branch.id}
              className="overview-branches__item"
              style={{ borderLeftColor: branch.color }}
            >
              <strong>{branch.title}</strong>
              <span>
                {branch.topics.length} {branch.topics.length === 1 ? "topic" : "topics"}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <img
        src={overviewImage}
        alt="History of Medicine — course overview"
        className="overview-infographic"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <p className="overview-hint muted">
        Open a coloured branch below, then choose a topic to start.
      </p>
      <button type="button" className="mobile-browse-btn" onClick={() => setMobileMenuOpen(true)}>
        Browse branches →
      </button>
    </div>
  );

  const toggleBranch = (id: string) => {
    setOpenBranches((o) => ({ ...o, [id]: !o[id] }));
  };

  const selectTopic = useCallback((branchId: string, topic: LeafTopic) => {
    setAtHome(false);
    setSelection({ branchId, topicId: topic.id });
    setMobileMenuOpen(false);
    setTab("video");

    const next = collapsedRecord(branches.map((b) => b.id));
    next[branchId] = true;
    setOpenBranches(next);
  }, []);

  const topicScrollKey = selection ? `${selection.branchId}:${selection.topicId}` : null;

  useEffect(() => {
    if (!topicScrollKey) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [topicScrollKey]);

  const goToEntry = () => {
    setAtHome(true);
    setSelection(null);
    setMobileMenuOpen(false);
    setOpenBranches(collapsedRecord(branches.map((b) => b.id)));
  };

  const openMobileMenu = () => {
    setMobileMenuOpen(true);
  };

  return (
    <div className={`app-shell ${shellMode}`}>
      <header className={`app-header${showMobileLessonBar ? " app-header--compact-mobile" : ""}`}>
        <button
          type="button"
          className="home-overview-btn"
          onClick={goToEntry}
          aria-label="Back to course overview"
        >
          <span className="home-overview-btn__media">
            <img
              src={overviewImage}
              alt=""
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="home-overview-btn__fallback" aria-hidden>
              ⊕
            </span>
          </span>
          <span className="home-overview-btn__label">Course overview</span>
        </button>
        <h1>{courseTitle}</h1>
        {userEmail ? (
          <div className="app-header__actions">
            <div className="auth-account">
              <span className="auth-account__email" title={userEmail}>
                {userEmail}
              </span>
              <button type="button" className="btn-ghost" onClick={() => void logout()}>
                Sair
              </button>
            </div>
          </div>
        ) : null}
      </header>

      {showMobileLessonBar && mobileLessonContext ? (
        <div
          className="mobile-lesson-bar"
          style={{ borderLeftColor: mobileLessonContext.color }}
        >
          <button type="button" className="mobile-menu-back" onClick={openMobileMenu}>
            ← Menu
          </button>
          <div className="mobile-lesson-bar__text">
            <span className="mobile-lesson-bar__chapter">{mobileLessonContext.chapter}</span>
            <span className="mobile-lesson-bar__sub">{mobileLessonContext.subchapter}</span>
          </div>
        </div>
      ) : null}

      <div className="layout">
        <div className="sidebar-column">
          <nav className="sidebar" aria-label="Course branches">
            {branches.map((branch) => (
              <BranchAccordion
                key={branch.id}
                branch={branch}
                isOpen={openBranches[branch.id]}
                selectedTopicId={selection?.branchId === branch.id ? selection.topicId : null}
                onToggle={toggleBranch}
                onPickTopic={selectTopic}
              />
            ))}
          </nav>
        </div>

        <main
          ref={mainRef}
          className={`main${atHome ? " main--overview" : ""}`}
          data-system-tint={activeBranchId ?? undefined}
        >
          {atHome ? (
            overviewPanel
          ) : selectedBranch && selectedTopic ? (
            <TopicContent
              branchTitle={selectedBranch.title}
              topic={selectedTopic}
              tab={tab}
              onTabChange={setTab}
            />
          ) : (
            <div className="browse-view">
              <div className="media-stage media-stage--placeholder">
                <p>Choose a coloured branch in the menu on the left, then select a topic.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
