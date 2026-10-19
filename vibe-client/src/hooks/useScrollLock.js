import { useEffect } from "react";
import { lockScroll, unlockScroll } from "../utils/scrollLock";

/**
 * Custom React hook to lock background scrolling while a modal/overlay is open.
 *
 * @param {boolean} isLocked - Whether background scroll should be locked (pass true when modal is open)
 */
export const useScrollLock = (isLocked = true) => {
  useEffect(() => {
    if (!isLocked) return;

    lockScroll();

    return () => {
      unlockScroll();
    };
  }, [isLocked]);
};

export default useScrollLock;
