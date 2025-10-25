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

  const scale = isPressed ? 0.75 : isClickable ? 1.15 : 1;

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-200 ease-out ${isVisible && !isTextField ? 'opacity-100' : 'opacity-0'}`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
    >
      <div
        className="relative"
        style={{
          transform: `translate3d(-50%, -50%, 0) scale(${scale})`,
          transition: 'transform 150ms ease-out',
        }}
      >
        <span
          className="absolute left-1/2 top-1/2 block h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.55),rgba(155,92,246,0.45)_45%,rgba(255,95,109,0.4)_70%,rgba(255,195,113,0.35))] opacity-70 blur-3xl"
          style={{
            transition: 'opacity 200ms ease-out, filter 200ms ease-out',
            opacity: isPressed ? 0.4 : isClickable ? 0.85 : 0.7,
          }}
        />
        <span
          className="relative block h-12 w-12 rounded-full border border-white/40 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.75),rgba(155,92,246,0.6)_45%,rgba(255,95,109,0.55)_70%,rgba(255,195,113,0.5))] shadow-[0_0_35px_rgba(155,92,246,0.35)] backdrop-blur-[2px]"
          style={{
            transition: 'box-shadow 200ms ease-out, border 200ms ease-out',
            boxShadow: isPressed
              ? '0 0 45px rgba(255,95,109,0.45)'
              : isClickable
              ? '0 0 55px rgba(155,92,246,0.55)'
              : '0 0 35px rgba(155,92,246,0.35)',
            mixBlendMode: 'screen',
          }}
        />
        <span
          className="absolute left-1/2 top-1/2 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{
            transition: 'transform 150ms ease-out, opacity 150ms ease-out',
            transform: `translate(-50%, -50%) scale(${isPressed ? 0.5 : isClickable ? 1.4 : 1})`,
            opacity: isTextField ? 0 : 1,
          }}
        />
      </div>
    </div>
  );
};

export default AmazingCursor;

