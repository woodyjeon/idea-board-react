import { useCallback, useEffect, useRef } from "react";

const DRAG_CLICK_THRESHOLD = 4;
const OVERSCROLL_YEAR_THRESHOLD = 56;
const SWIPE_YEAR_THRESHOLD = 72;

function getSidebarWidth(scrollEl) {
  const root = scrollEl?.closest(".gantt-chart-root");
  const raw = getComputedStyle(root ?? scrollEl ?? document.documentElement).getPropertyValue(
    "--roadmap-sidebar-width",
  );
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function useGanttDragNavigation({
  centerYear,
  viewYearCount,
  onShiftYear,
}) {
  const scrollRef = useRef(null);
  const dragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    lastX: 0,
    overscroll: 0,
    dragged: false,
  });

  const scrollToCenterYear = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const sidebarWidth = getSidebarWidth(el);

    if (viewYearCount <= 1) {
      el.scrollLeft = 0;
      return;
    }

    const totalTimelineWidth = Math.max(el.scrollWidth - sidebarWidth, 1);
    const yearWidth = totalTimelineWidth / viewYearCount;
    const centerIndex = Math.floor(viewYearCount / 2);
    const centerStart = sidebarWidth + centerIndex * yearWidth;
    const visibleTimeline = Math.max(el.clientWidth - sidebarWidth, yearWidth);
    const target = centerStart - (visibleTimeline - yearWidth) / 2;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);

    el.scrollLeft = Math.max(0, Math.min(target, maxScroll));
  }, [viewYearCount]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    let frameId = 0;

    function scheduleScroll() {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        scrollToCenterYear();
      });
    }

    scheduleScroll();

    const observer = new ResizeObserver(scheduleScroll);
    observer.observe(el);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [centerYear, viewYearCount, scrollToCenterYear]);

  const finishDrag = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag.active || event.pointerId !== drag.pointerId) return;

      const el = scrollRef.current;
      if (el?.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }
      el?.classList.remove("gantt-chart-scroll--dragging");

      const maxScroll = Math.max(0, (el?.scrollWidth ?? 0) - (el?.clientWidth ?? 0));
      const totalDelta = event.clientX - drag.startX;

      if (drag.overscroll >= OVERSCROLL_YEAR_THRESHOLD) {
        onShiftYear(-1);
      } else if (drag.overscroll <= -OVERSCROLL_YEAR_THRESHOLD) {
        onShiftYear(1);
      } else if (maxScroll <= 0 && drag.dragged) {
        if (totalDelta <= -SWIPE_YEAR_THRESHOLD) onShiftYear(1);
        else if (totalDelta >= SWIPE_YEAR_THRESHOLD) onShiftYear(-1);
      }

      dragRef.current = {
        active: false,
        pointerId: null,
        startX: 0,
        lastX: 0,
        overscroll: 0,
        dragged: false,
      };
    },
    [onShiftYear],
  );

  const handlePointerDown = useCallback((event) => {
    if (event.button !== 0) return;
    if (event.pointerType === "touch") return;
    if (event.target.closest("button, a, input, select, textarea, .gantt-bar")) return;

    const el = scrollRef.current;
    if (!el) return;

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      overscroll: 0,
      dragged: false,
    };

    el.setPointerCapture(event.pointerId);
    el.classList.add("gantt-chart-scroll--dragging");
  }, []);

  const handlePointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag.active || event.pointerId !== drag.pointerId) return;

    const el = scrollRef.current;
    if (!el) return;

    const deltaX = event.clientX - drag.lastX;
    drag.lastX = event.clientX;

    if (Math.abs(event.clientX - drag.startX) > DRAG_CLICK_THRESHOLD) {
      drag.dragged = true;
    }

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    el.scrollLeft -= deltaX;

    if (el.scrollLeft <= 0 && deltaX > 0) {
      drag.overscroll += deltaX;
    } else if (el.scrollLeft >= maxScroll && deltaX < 0) {
      drag.overscroll += deltaX;
    } else if (el.scrollLeft > 0 && el.scrollLeft < maxScroll) {
      drag.overscroll = 0;
    }

    if (el.scrollLeft < 0) el.scrollLeft = 0;
    if (el.scrollLeft > maxScroll) el.scrollLeft = maxScroll;
  }, []);

  return {
    scrollRef,
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
    },
  };
}
