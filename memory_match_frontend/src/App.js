import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Memory Match Game Main Component
 * Modern, light theme, primary (#007bff), secondary (#6c757d), accent (#ffc107).
 * Features: card-flipping animation, match detection, move counter, timer, restart, victory message.
 */

// --- Utility: Emoji set for game cards ---
const CARD_EMOJIS = [
  "🍕", "🍔", "🍎", "🍉", "🍟", "🥑",
  "🍩", "🍿"
];

// PUBLIC_INTERFACE
function shuffleAndPair(cards) {
  /** Returns a shuffled deck with two of each card. */
  const paired = [...cards, ...cards].map((emoji, idx) => ({
    id: idx,
    content: emoji,
    isFlipped: false,
    isMatched: false
  }));
  // Fisher-Yates Shuffle
  for (let i = paired.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [paired[i], paired[j]] = [paired[j], paired[i]];
  }
  return paired;
}

// PUBLIC_INTERFACE
function formatTime(totalSeconds) {
  /** Returns mm:ss string. */
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

const GAME_COLORS = {
  primary: "#007bff",
  secondary: "#6c757d",
  accent: "#ffc107"
};

function App() {
  // --- GAME STATE HOOKS ---
  const [deck, setDeck] = useState(shuffleAndPair(CARD_EMOJIS));
  const [flipped, setFlipped] = useState([]); // indices of flipped (unmatched) cards
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  // Light theme only (with room for dark, but default is light)
  const theme = "light"; // Could hook up a toggle if needed

  // --- TIMER ---
  useEffect(() => {
    let interval = null;
    if (running && !gameWon) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running, gameWon]);

  // --- Match logic and card flipping effects ---
  useEffect(() => {
    if (flipped.length === 2) {
      // block further flipping
      const [idx1, idx2] = flipped;
      const card1 = deck[idx1];
      const card2 = deck[idx2];
      if (card1.content === card2.content) {
        // Match!
        setTimeout(() => {
          setDeck(prev =>
            prev.map((c, i) =>
              i === idx1 || i === idx2
                ? { ...c, isMatched: true }
                : c
            )
          );
          setFlipped([]);
          setMatchedCount(m => m + 2);
        }, 600);
      } else {
        // No match – flip back after delay
        setTimeout(() => {
          setDeck(prev =>
            prev.map((c, i) =>
              i === idx1 || i === idx2
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlipped([]);
        }, 1000);
      }
      setMoves(m => m + 1);
    }
  }, [flipped, deck]);

  // --- Start/reset game ---
  function handleRestart() {
    setDeck(shuffleAndPair(CARD_EMOJIS));
    setFlipped([]);
    setMatchedCount(0);
    setMoves(0);
    setTimer(0);
    setGameWon(false);
    setRunning(false);
    setTimeout(() => setRunning(true), 300); // start timer after render
  }

  // --- Card click handler ---
  function handleCardClick(idx) {
    if (!running) setRunning(true);
    if (gameWon) return;
    if (flipped.includes(idx)) return;
    if (deck[idx].isMatched || deck[idx].isFlipped) return;
    if (flipped.length === 2) return; // block until unmatched pair is processed

    // Flip the card
    setDeck(prev =>
      prev.map((c, i) =>
        i === idx
          ? { ...c, isFlipped: true }
          : c
      )
    );
    setFlipped(prev => [...prev, idx]);
  }

  // --- Win detection ---
  useEffect(() => {
    if (matchedCount === deck.length && deck.length > 0) {
      setGameWon(true);
      setRunning(false);
    }
  }, [matchedCount, deck.length]);

  // --- On mount, start game ---
  useEffect(() => {
    setRunning(true);
  }, []);

  // --- UI ---
  return (
    <div
      className="App"
      style={{ background: "#fff", color: "#282c34", minHeight: "100vh" }}
    >
      <div className="memory-game-layout" style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "stretch",
        background: "var(--bg-secondary)",
      }}>
        {/* SIDEBAR */}
        <aside
          className="sidebar"
          style={{
            minWidth: 220,
            background: "#f8f9fa",
            padding: "2rem 1.5rem 1.5rem 1.5rem",
            borderRight: `1.5px solid ${GAME_COLORS.secondary}22`,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start"
          }}
        >
          <h2 style={{
            color: GAME_COLORS.primary,
            marginBottom: 24,
            fontWeight: 700,
            fontSize: "1.8rem",
            letterSpacing: "0.03em"
          }}>
            Memory<br />Match Game
          </h2>
          <div style={{ marginBottom: 20 }}>
            <span style={{
              color: GAME_COLORS.secondary,
              fontWeight: 600
            }}>Moves:</span>{" "}
            <span style={{
              color: GAME_COLORS.primary,
              fontWeight: 700,
              paddingLeft: 4
            }}>{moves}</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span style={{ color: GAME_COLORS.secondary, fontWeight: 600 }}>
              Time:
            </span>{" "}
            <span style={{
              color: GAME_COLORS.primary,
              fontWeight: 700,
              paddingLeft: 4
            }}>{formatTime(timer)}</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span style={{
              color: GAME_COLORS.secondary,
              fontWeight: 600,
            }}>
              Matched:
            </span>{" "}
            <span style={{
              color: GAME_COLORS.accent,
              fontWeight: 800,
              fontSize: "1.05em",
            }}>
              {matchedCount / 2} / {deck.length / 2}
            </span>
          </div>
          <button
            className="restart-btn"
            style={{
              background: GAME_COLORS.primary,
              color: "#fff",
              fontWeight: 600,
              border: "none",
              padding: "0.6em 1.5em",
              marginTop: 12,
              borderRadius: 7,
              letterSpacing: "0.03em",
              boxShadow: "0 2px 15px #007bff20",
              fontSize: "1.08em",
              cursor: "pointer",
              outline: "none",
              transition: "background .18s"
            }}
            onClick={handleRestart}
          >Restart</button>
        </aside>

        {/* GAME BOARD/AREA */}
        <main
          className="game-board-section"
          style={{
            flex: 1,
            padding: "2.5rem 3vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {/* WIN SCREEN OVERLAY */}
          {gameWon &&
            <div
              className="game-victory-overlay"
              style={{
                zIndex: 9,
                position: "absolute",
                left: "50%",
                top: "48%",
                transform: "translate(-50%, -50%)",
                minWidth: 300,
                width: "min(90vw, 370px)",
                background: "#fff",
                border: `2.5px solid ${GAME_COLORS.accent}`,
                borderRadius: 14,
                boxShadow: `0 6px 44px #007bff25, 0 1.5px 7px #0002`,
                padding: "2.2em 1.8em 1.3em 1.8em",
                textAlign: "center"
              }}
            >
              <h2 style={{
                color: GAME_COLORS.primary,
                margin: "0 0 0.45em 0",
                fontSize: "2em"
              }}>
                🎉 You Win!
              </h2>
              <div style={{
                marginBottom: "0.7em",
                fontWeight: 600,
                color: GAME_COLORS.secondary,
                fontSize: "1.12em"
              }}>
                Puzzle completed in <span style={{
                  color: GAME_COLORS.primary
                }}>{moves}</span> moves<br />
                Time: <span style={{ color: GAME_COLORS.primary }}>{formatTime(timer)}</span>
              </div>
              <button
                onClick={handleRestart}
                style={{
                  marginTop: 20,
                  background: GAME_COLORS.accent,
                  color: "#282c34",
                  fontWeight: 700,
                  padding: "0.7em 2.1em",
                  fontSize: "1.1em",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  outline: "none",
                  transition: "background .18s"
                }}
              >
                Play Again
              </button>
            </div>
          }
          {/* INFO: Score/Timer Heading (mirrored from sidebar for mobile) */}
          <div className="game-info-mobile" style={{
            display: "none",
            marginBottom: "2.1em"
          }}>
            {/* For small screens, can show minimal counter */}
          </div>
          {/* Game Board */}
          <div
            className="game-board"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 78px)",
              gridTemplateRows: "repeat(4, 78px)",
              gap: "18px",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "2.8em",
              position: "relative",
              width: 4 * 78 + 3 * 18,
              background: "#f8faff",
              border: `2.5px solid ${GAME_COLORS.secondary}20`,
              borderRadius: 15,
              padding: "28px 22px",
              boxShadow: `0 2px 12px #007bff09, 0 1.5px 5px #0001`
            }}
          >
            {deck.map((card, i) => (
              <Card
                key={card.id}
                content={card.content}
                isFlipped={card.isFlipped}
                isMatched={card.isMatched}
                onClick={() => handleCardClick(i)}
                accent={GAME_COLORS.accent}
                secondary={GAME_COLORS.secondary}
                disabled={flipped.length === 2 || card.isFlipped || card.isMatched || gameWon}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Card component with flip animation.
 * Ensures that the emoji is hidden (shows "?") until the card is flipped or matched.
 * Emoji (front) is only revealed if isFlipped or isMatched, else shows "?" (back).
 */
function Card({ content, isFlipped, isMatched, onClick, accent, secondary, disabled }) {
  // The card should show the front (emoji) ONLY if it's flipped OR matched
  const shouldShowFront = isFlipped || isMatched;

  return (
    <div
      className="card-container"
      style={{
        perspective: "650px",
        width: 70,
        height: 70,
        margin: "auto"
      }}
      tabIndex={disabled ? -1 : 0}
      aria-label={shouldShowFront ? `${content} card` : `unflipped card`}
      onClick={disabled ? undefined : onClick}
      onKeyDown={e => (!disabled && (e.key === 'Enter' || e.key === ' ')) && onClick()}
      role="button"
    >
      <div
        className={`card-flipper${shouldShowFront ? " flipped" : ""}${isMatched ? " matched" : ""}`}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transition: "transform .52s cubic-bezier(.58,1.6,.24,1)",
          transformStyle: "preserve-3d",
          transform: shouldShowFront ? "rotateY(180deg)" : "rotateY(0deg)"
        }}>
        {/* Front face - shows emoji when flipped/matched */}
        <div
          className="card card-front"
          style={{
            boxSizing: "border-box",
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: 11,
            backfaceVisibility: "hidden",
            background: isMatched
              ? accent + "44"
              : "#fff",
            border: isMatched
              ? `2.8px solid ${accent}`
              : `2.5px solid ${secondary}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2em",
            color: "#222",
            boxShadow: isMatched
              ? `0 0 9px 1.5px ${accent}99`
              : `0 1px 6px #0001`,
            transform: "rotateY(180deg)" // Front face is rotated 180deg so it shows when container is flipped
          }}
        >
          {shouldShowFront ? content : ""}
        </div>
        {/* Back face - shows question mark by default */}
        <div
          className="card card-back"
          style={{
            boxSizing: "border-box",
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: 11,
            backfaceVisibility: "hidden",
            background: `linear-gradient(145deg, ${secondary}99 70%, ${accent} 100%)`,
            border: `2px solid ${secondary}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2em",
            color: "#fff",
            fontWeight: 700,
            boxShadow: "0 2px 10px #007bff15, 0 2px 7px #00000017"
          }}
        >
          {shouldShowFront ? "" : "?"}
        </div>
      </div>
    </div>
  );
}

export default App;
