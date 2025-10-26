import { useEffect } from "react";

const BIBATA_POINTER =
  "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 256 256' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M201.163 133.54L201.149 133.528L201.134 133.515L91.6855 36.4935C86.5144 31.7659 81.4269 27.9549 76.5421 25.525C71.7671 23.1497 66.0861 21.5569 60.4133 23.1213C54.3118 24.8039 50.4875 29.4674 48.3639 34.759C46.3122 39.8715 45.4999 46.2787 45.4999 53.5383L45.4999 200.431V200.493L45.5008 200.555C45.6218 208.862 50.4279 217.843 55.9963 223.894C58.8934 227.043 62.5163 229.986 66.6704 231.742C70.9172 233.537 76.217 234.254 81.4691 231.884C85.7536 229.951 89.6754 226.055 92.8565 222.651C94.6841 220.695 96.8336 218.252 99.0355 215.749C100.71 213.847 102.414 211.91 104.03 210.126C112.189 201.122 121.346 192.286 132.161 187.407C143.013 182.511 155.809 181.375 167.963 181.146C170.959 181.089 173.85 181.087 176.65 181.085H176.663H176.686C179.447 181.083 182.164 181.081 184.662 181.019C189.231 180.906 194.643 180.609 198.777 178.88C208.711 174.723 210.972 163.838 210.753 156.445C210.521 148.596 207.57 139.272 201.163 133.54Z' fill='white' stroke='black' stroke-width='17'/%3E%3C/svg%3E";

const BIBATA_POINTER_ACTIVE =
  "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 256 256' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M80 40V80H176V176H216V40H80Z' fill='white' stroke='black' stroke-width='16'/%3E%3Cpath d='M176 80L80 176' stroke='black' stroke-width='20'/%3E%3C/svg%3E";

const BIBATA_TEXT =
  "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 256 256' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M128 32V224M80 48H176M80 208H176' stroke='white' stroke-width='24'/%3E%3Cpath d='M128 32V224M80 48H176M80 208H176' stroke='black' stroke-width='12'/%3E%3C/svg%3E";

const AmazingCursor = () => {
  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const existing = document.getElementById("amazing-cursor-style");
    if (existing) {
      existing.remove();
    }

    const style = document.createElement("style");
    style.id = "amazing-cursor-style";
    style.textContent = `
      body, body * {
        cursor: url("${BIBATA_POINTER}") 0 0, default !important;
      }

      a, button, [role="button"], [data-super-cursor="interactive"],
      input[type="checkbox"], input[type="radio"], select, summary,
      .cursor-pointer {
        cursor: url("${BIBATA_POINTER_ACTIVE}") 4 2, pointer !important;
      }

      input, textarea, [contenteditable="true"], [data-super-cursor="text"],
      .cursor-text {
        cursor: url("${BIBATA_TEXT}") 12 12, text !important;
      }
    `;

    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  return null;
};

export default AmazingCursor;
