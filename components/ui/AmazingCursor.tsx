import { useEffect, useState } from 'react';

const BIBATA_POINTER_PATH =
  'M201.163 133.54L201.149 133.528L201.134 133.515L91.6855 36.4935C86.5144 31.7659 81.4269 27.9549 76.5421 25.525C71.7671 23.1497 66.0861 21.5569 60.4133 23.1213C54.3118 24.8039 50.4875 29.4674 48.3639 34.759C46.3122 39.8715 45.4999 46.2787 45.4999 53.5383L45.4999 200.431V200.493L45.5008 200.555C45.6218 208.862 50.4279 217.843 55.9963 223.894C58.8934 227.043 62.5163 229.986 66.6704 231.742C70.9172 233.537 76.217 234.254 81.4691 231.884C85.7536 229.951 89.6754 226.055 92.8565 222.651C94.6841 220.695 96.8336 218.252 99.0355 215.749C100.71 213.847 102.414 211.91 104.03 210.126C112.189 201.122 121.346 192.286 132.161 187.407C143.013 182.511 155.809 181.375 167.963 181.146C170.959 181.089 173.85 181.087 176.65 181.085H176.663H176.686C179.447 181.083 182.164 181.081 184.662 181.019C189.231 180.906 194.643 180.609 198.777 178.88C208.711 174.723 210.972 163.838 210.753 156.445C210.521 148.596 207.57 139.272 201.163 133.54Z';

const POINTER_VIEWBOX = { minX: 0, minY: 0, width: 256, height: 256 } as const;
const POINTER_TIP = { x: 65.16, y: 22.5 } as const;

const BIBATA_TEXT_PATH = 'M128 32V224M80 48H176M80 208H176';
const TEXT_VIEWBOX = { minX: 68, minY: 20, width: 120, height: 216 } as const;

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

  const scale = isPressed ? 0.94 : isClickable ? 1.04 : 1;
  const pointerStroke = '#000000';
  const pointerFill = '#ffffff';
  const pointerShadow = isPressed
    ? 'drop-shadow(0 2px 6px rgba(15, 23, 42, 0.35))'
    : 'drop-shadow(0 6px 18px rgba(15, 23, 42, 0.38))';

  const pointerHeight = 42;
  const pointerWidth = (POINTER_VIEWBOX.width / POINTER_VIEWBOX.height) * pointerHeight;
  const pointerHotspotX =
    ((POINTER_TIP.x - POINTER_VIEWBOX.minX) / POINTER_VIEWBOX.width) * pointerWidth + 0.5;
  const pointerHotspotY =
    ((POINTER_TIP.y - POINTER_VIEWBOX.minY) / POINTER_VIEWBOX.height) * pointerHeight + 0.85;

  const textHeight = 44;
  const textWidth = (TEXT_VIEWBOX.width / TEXT_VIEWBOX.height) * textHeight;
  const textHotspotX = textWidth / 2;
  const textHotspotY = textHeight / 2 + 1.5;

  const hotspotX = isTextField ? textHotspotX : pointerHotspotX;
  const hotspotY = isTextField ? textHotspotY : pointerHotspotY;

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-150 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
    >
      <div
        className="relative"
        style={{
          transform: `translate3d(${-hotspotX}px, ${-hotspotY}px, 0) scale(${scale})`,
          transition: 'transform 140ms ease-out',
          willChange: 'transform',
        }}
      >
        {!isTextField && (
          <svg
            className="block"
            width={pointerWidth}
            height={pointerHeight}
            viewBox={`${POINTER_VIEWBOX.minX} ${POINTER_VIEWBOX.minY} ${POINTER_VIEWBOX.width} ${POINTER_VIEWBOX.height}`}
            style={{
              filter: pointerShadow,
              transition: 'filter 160ms ease-out',
            }}
          >
            <path
              d={BIBATA_POINTER_PATH}
              fill={pointerFill}
              stroke={pointerStroke}
              strokeWidth={17}
              strokeLinejoin="round"
            />
          </svg>
        )}
        {isTextField && (
          <svg
            className="block"
            width={textWidth}
            height={textHeight}
            viewBox={`${TEXT_VIEWBOX.minX} ${TEXT_VIEWBOX.minY} ${TEXT_VIEWBOX.width} ${TEXT_VIEWBOX.height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
              transform: `scaleY(${isPressed ? 0.86 : 1})`,
              transition: 'transform 140ms ease-out',
              filter: 'drop-shadow(0 0 12px rgba(15, 23, 42, 0.35))',
            }}
          >
            <path d={BIBATA_TEXT_PATH} stroke="#ffffff" strokeWidth={24} strokeLinecap="round" />
            <path d={BIBATA_TEXT_PATH} stroke="#000000" strokeWidth={12} strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default AmazingCursor;

