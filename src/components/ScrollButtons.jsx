import { ChevronDown, ChevronUp } from "lucide-react";

function ScrollButtons() {
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToBottom() {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }

  return (
    <div className="scroll-controls" aria-label="페이지 이동">
      <button
        type="button"
        className="scroll-btn"
        onClick={scrollToTop}
        aria-label="맨 위로"
        title="맨 위로"
      >
        <ChevronUp size={16} strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="scroll-btn"
        onClick={scrollToBottom}
        aria-label="맨 아래로"
        title="맨 아래로"
      >
        <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}

export default ScrollButtons;
