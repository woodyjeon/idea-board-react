import { useCallback, useEffect, useRef } from "react";
import {
  ROADMAP_MONTHS_PER_YEAR,
  ROADMAP_MULTI_YEAR_MONTH_WIDTH,
} from "../constants/roadmapMonths";

const DRAG_CLICK_THRESHOLD = 4;
const OVERSCROLL_YEAR_THRESHOLD = 56;
const SWIPE_YEAR_THRESHOLD = 72;

function getSidebarWidth() {
  if (typeof document === "undefined") return 300;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--roadmap-sidebar-width",
  );
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 300;
}

export function useGanttDragNavigation({ centerYear, onShiftYear }) {
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

    const sidebarWidth = getSidebarWidth();
    const yearWidth = ROADMAP_MONTHS_PER_YEAR * ROADMAP_MULTI_YEAR_MONTH_WIDTH;
    const centerStart = sidebarWidth + yearWidth;
    const visibleTimeline = Math.max(el.clientWidth - sidebarWidth, yearWidth);
    const target = centerStart - (visibleTimeline - yearWidth) / 2;

    el.scrollLeft = Math.max(0, target);
  }, []);

  useEffect(() => {
    scrollToCenterYear();
  }, [centerYear, scrollToCenterYear]);

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
    if (event.target.closest("button, a, input, select, textarea")) return;

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
