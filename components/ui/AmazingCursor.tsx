import { useCallback, useEffect, useState } from "react";

type CursorKind = "default" | "clickable" | "text";

const INTERACTIVE_TARGETS = [
  "a",
  "button",
  '[role="button"]',
  '[data-super-cursor="interactive"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  "select",
  "summary",
  ".cursor-pointer",
];

const TEXT_TARGETS = [
  "input",
  "textarea",
  '[contenteditable="true"]',
  '[data-super-cursor="text"]',
  ".cursor-text",
];

const CLICKABLE_SELECTOR = INTERACTIVE_TARGETS.join(", ");
const TEXT_SELECTOR = TEXT_TARGETS.join(", ");
const STYLE_TAG_ID = "amazing-cursor-style";

const BIBATA_POINTER = "/cursor/bibata-pointer.svg";

const BIBATA_POINTER_ACTIVE = BIBATA_POINTER;

const BIBATA_HAND =
  "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 256 256' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M144 24C130.745 24 120 34.7452 120 48V116H108V60C108 46.7452 97.2548 36 84 36C70.7452 36 60 46.7452 60 60V132.283L43.7571 118.35C32.683 109.349 16.8392 111.675 8 123.199C3.14491 134.743 5.52273 150.952 16.5968 159.953L68 204.951V224C68 240.569 81.4315 254 98 254H174C189.165 254 202.132 243.963 205.709 229.233L223.861 165.905C226.961 152.86 219.072 139.82 206.186 136.024L198 133.584V76C198 62.7452 187.255 52 174 52C168.261 52 162.91 53.8242 158.485 57.0771C155.801 41.6926 148.735 28 144 24Z' fill='black' stroke='white' stroke-width='18' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

const BIBATA_HAND_PRESSED =
  "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 256 256' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M144 24C130.745 24 120 34.7452 120 48V116H108V60C108 46.7452 97.2548 36 84 36C70.7452 36 60 46.7452 60 60V132.283L43.7571 118.35C32.683 109.349 16.8392 111.675 8 123.199C3.14491 134.743 5.52273 150.952 16.5968 159.953L68 204.951V224C68 240.569 81.4315 254 98 254H174C189.165 254 202.132 243.963 205.709 229.233L223.861 165.905C226.961 152.86 219.072 139.82 206.186 136.024L198 133.584V76C198 62.7452 187.255 52 174 52C168.261 52 162.91 53.8242 158.485 57.0771C155.801 41.6926 148.735 28 144 24Z' fill='%23191919' stroke='white' stroke-width='18' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

const BIBATA_TEXT =
  "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 256 256' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M128 32V224M80 48H176M80 208H176' stroke='white' stroke-width='24'/%3E%3Cpath d='M128 32V224M80 48H176M80 208H176' stroke='black' stroke-width='12'/%3E%3C/svg%3E";

const FALLBACK_SCOPE = "body:not(.super-cursor-active)";

const joinWithScope = (scope: string, selectors: string[]) =>
  selectors.map((selector) => `${scope} ${selector}`).join(",\n      ");

const INTERACTIVE_STYLE_SCOPE = joinWithScope(
  FALLBACK_SCOPE,
  INTERACTIVE_TARGETS
);
const INTERACTIVE_CHILD_SCOPE = joinWithScope(
  FALLBACK_SCOPE,
  INTERACTIVE_TARGETS.map((selector) => `${selector} *`)
);
const INTERACTIVE_ACTIVE_SCOPE = joinWithScope(
  FALLBACK_SCOPE,
  INTERACTIVE_TARGETS.map((selector) => `${selector}:active`)
);
const INTERACTIVE_PRESSED_CHILD_SCOPE = joinWithScope(
  FALLBACK_SCOPE,
  INTERACTIVE_TARGETS.map((selector) => `${selector}:active *`)
);
const INTERACTIVE_ARIA_PRESSED_SCOPE = joinWithScope(
  FALLBACK_SCOPE,
  INTERACTIVE_TARGETS.map((selector) => `${selector}[aria-pressed="true"]`)
);
const INTERACTIVE_ARIA_PRESSED_CHILD_SCOPE = joinWithScope(
  FALLBACK_SCOPE,
  INTERACTIVE_TARGETS.map((selector) => `${selector}[aria-pressed="true"] *`)
);
const TEXT_STYLE_SCOPE = joinWithScope(FALLBACK_SCOPE, TEXT_TARGETS);
const TEXT_CHILD_SCOPE = joinWithScope(
  FALLBACK_SCOPE,
  TEXT_TARGETS.map((selector) => `${selector} *`)
);

const AmazingCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [kind, setKind] = useState<CursorKind>("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [pressedKind, setPressedKind] = useState<CursorKind | null>(null);

  const getKindForTarget = useCallback((node: EventTarget | null): CursorKind => {
    if (!node || !(node instanceof Element)) {
      return "default";
    }

    if (node.closest(TEXT_SELECTOR)) {
      return "text";
    }

    if (node.closest(CLICKABLE_SELECTOR)) {
      return "clickable";
    }

    return "default";
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const media = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(media.matches);

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const existing = document.getElementById(STYLE_TAG_ID);
    if (existing) {
      existing.remove();
    }

    const style = document.createElement("style");
    style.id = STYLE_TAG_ID;
    style.textContent = `
      ${FALLBACK_SCOPE},
      ${FALLBACK_SCOPE} * {
        cursor: url("${BIBATA_POINTER}") 0 0, default !important;
      }

      ${INTERACTIVE_STYLE_SCOPE},
      ${INTERACTIVE_CHILD_SCOPE} {
        cursor: url("${BIBATA_HAND}") 10 2, pointer !important;
      }

      ${INTERACTIVE_ACTIVE_SCOPE},
      ${INTERACTIVE_PRESSED_CHILD_SCOPE},
      ${INTERACTIVE_ARIA_PRESSED_SCOPE},
      ${INTERACTIVE_ARIA_PRESSED_CHILD_SCOPE} {
        cursor: url("${BIBATA_HAND_PRESSED}") 10 4, pointer !important;
      }

      ${TEXT_STYLE_SCOPE},
      ${TEXT_CHILD_SCOPE} {
        cursor: url("${BIBATA_TEXT}") 12 12, text !important;
      }
    `;

    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return undefined;
    }

    const body = document.body;
    body.classList.add("super-cursor-active");

    const handleMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
      setIsVisible(true);

      setKind(getKindForTarget(event.target));
    };

    const handleLeave = () => {
      setIsVisible(false);
      setIsPressed(false);
      setPressedKind(null);
    };

    const handleEnter = () => {
      setIsVisible(true);
    };

    const handleDown = (event: MouseEvent) => {
      if (event.button === 0) {
        const pressKind = getKindForTarget(event.target);
        setPressedKind(pressKind);
        setIsPressed(true);
      }
    };

    const handleUp = () => {
      setIsPressed(false);
      setPressedKind(null);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        setIsVisible(false);
        setIsPressed(false);
        setPressedKind(null);
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("mouseenter", handleEnter);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      body.classList.remove("super-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("mouseenter", handleEnter);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, getKindForTarget]);

  if (!enabled) {
    return null;
  }

  const isText = kind === "text";
  const isClickable = kind === "clickable";
  const isPressingClickable = isPressed && pressedKind === "clickable";
  const isPressingDefault = isPressed && pressedKind === "default";
  const sprite = isText
    ? BIBATA_TEXT
    : isPressingClickable
    ? BIBATA_HAND_PRESSED
    : isClickable
    ? BIBATA_HAND
    : isPressingDefault
    ? BIBATA_POINTER_ACTIVE
    : BIBATA_POINTER;

  const showHand = isClickable || isPressingClickable;

  const offsetX = isText ? 12 : showHand ? 10 : 0;
  const offsetY = isText ? 12 : showHand ? (isPressingClickable ? 4 : 2) : 0;

  const scale = isText
    ? 1
    : isPressingClickable
    ? 0.96
    : showHand
    ? 1.04
    : isPressingDefault
    ? 0.94
    : 1;

  const dropShadow = isText
    ? "drop-shadow(0 1px 1px rgba(0,0,0,0.45))"
    : isPressingClickable
    ? "drop-shadow(0 3px 4px rgba(0,0,0,0.55))"
    : showHand
    ? "drop-shadow(0 2px 4px rgba(0,0,0,0.48))"
    : isPressed
    ? "drop-shadow(0 3px 3px rgba(0,0,0,0.5))"
    : "drop-shadow(0 2px 3px rgba(0,0,0,0.45))";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 120ms ease-out",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translate3d(${position.x - offsetX}px, ${
            position.y - offsetY
          }px, 0) scale(${scale})`,
          transformOrigin: "top left",
          transition: "transform 90ms ease-out",
        }}
      >
        <img
          alt=""
          src={sprite}
          width={32}
          height={32}
          style={{
            display: "block",
            filter: dropShadow,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </span>
    </div>
  );
};

export default AmazingCursor;
