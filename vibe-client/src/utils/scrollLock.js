/**
 * Reusable scroll lock manager for VIBE modals and overlays.
 *
 * Features:
 * - Reference counted: safely supports multiple/nested modals.
 * - Compensates for scrollbar width to prevent layout shifts.
 * - Remembers and restores the exact scroll position upon closing.
 * - Sets CSS classes and overscroll behavior containment.
 */

let lockCount = 0;
let savedScrollY = 0;
let originalBodyStyles = {
  overflow: "",
  paddingRight: "",
};
let originalHtmlStyles = {
  overflow: "",
};

export const lockScroll = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (lockCount === 0) {
    // 1. Record current scroll position
    savedScrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    // 2. Measure scrollbar width before locking to avoid layout jump
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // 3. Save original inline styles
    originalBodyStyles = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };
    originalHtmlStyles = {
      overflow: document.documentElement.style.overflow,
    };

    // 4. Lock both html and body
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // 5. Add classes for global CSS containment
    document.documentElement.classList.add("vibe-scroll-locked");
    document.body.classList.add("vibe-scroll-locked");
  }

  lockCount++;
};

export const unlockScroll = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    // 1. Restore original inline styles
    document.documentElement.style.overflow = originalHtmlStyles.overflow || "";
    document.body.style.overflow = originalBodyStyles.overflow || "";
    document.body.style.paddingRight = originalBodyStyles.paddingRight || "";

    // 2. Remove CSS classes
    document.documentElement.classList.remove("vibe-scroll-locked");
    document.body.classList.remove("vibe-scroll-locked");

    // 3. Restore scroll position instantaneously
    window.scrollTo(0, savedScrollY);
  }
};

export const getLockCount = () => lockCount;
