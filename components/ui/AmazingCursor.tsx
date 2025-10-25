import { useEffect, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

const CLICKABLE_SELECTOR =
  'button, a, [role="button"], [data-super-cursor="interactive"], input[type="checkbox"], input[type="radio"], select, summary, .cursor-pointer';

const TEXT_SELECTOR = 'input, textarea, [contenteditable="true"], [data-super-cursor="text"]';

const AmazingCursor = () => {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isClickable, setIsClickable] = useState(false);
  const [isTextField, setIsTextField] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia('(pointer: fine)');
    const update = () => setEnabled(media.matches);

    update();
    media.addEventListener('change', update);

    return () => {
      media.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const body = document.body;
    body.classList.add('super-cursor-active');

    const handleMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
      setIsVisible(true);

      const target = event.target as HTMLElement | null;

      if (target) {
        const clickable = target.closest(CLICKABLE_SELECTOR);
        const textField = target.closest(TEXT_SELECTOR);

        setIsClickable(Boolean(clickable));
        setIsTextField(Boolean(textField));
      } else {
        setIsClickable(false);
        setIsTextField(false);
      }
    };

    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);
    const handleDown = () => setIsPressed(true);
    const handleUp = () => setIsPressed(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', handleLeave);
    window.addEventListener('mouseenter', handleEnter);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      body.classList.remove('super-cursor-active');
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('mouseenter', handleEnter);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  const scale = isPressed ? 0.9 : isClickable ? 1.05 : 1;
  const pointerColor = isClickable ? 'rgba(124, 58, 237, 0.95)' : 'rgba(15, 23, 42, 0.95)';
  const pointerStroke = isClickable ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.45)';
  const pointerShadow = isPressed
    ? 'drop-shadow(0 2px 8px rgba(15, 23, 42, 0.35))'
    : isClickable
    ? 'drop-shadow(0 4px 14px rgba(124, 58, 237, 0.45))'
    : 'drop-shadow(0 4px 12px rgba(15, 23, 42, 0.35))';

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-150 ease-out ${
        isVisible && !isTextField ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
    >
      <div
        className="relative"
        style={{
          transform: `translate3d(-4px, -1px, 0) scale(${scale})`,
          transition: 'transform 140ms ease-out',
        }}
      >
        {!isTextField && (
          <svg
            className="block"
            width={28}
            height={32}
            viewBox="0 0 28 32"
            style={{
              filter: pointerShadow,
              transition: 'filter 160ms ease-out',
            }}
          >
            <path
              d="M3.5 1L3.5 21.2L8.6 16.4L13.8 29L17.4 27.4L12.2 14.8L19.8 15L3.5 1Z"
              fill={pointerColor}
              stroke={pointerStroke}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
          </svg>
        )}
        {!isTextField && (
          <span
            className="absolute left-[18px] top-[20px] block h-3 w-3 rounded-full bg-white/70"
            style={{
              opacity: isClickable ? 0.9 : 0.6,
              transition: 'opacity 180ms ease-out',
            }}
          />
        )}
        {isTextField && (
          <span
            className="block h-8 w-[2px] rounded-full bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300"
            style={{
              transform: `translate3d(-1px, -20px, 0) scaleY(${isPressed ? 0.8 : 1})`,
              transition: 'transform 140ms ease-out',
              boxShadow: '0 0 10px rgba(15, 23, 42, 0.35)',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AmazingCursor;

