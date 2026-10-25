"use client";

import { Suspense, useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  groupRowIndices,
  locate,
  nextTarget,
  sortWithinRow,
  type Dir,
  type Rect,
} from "@/lib/tv-spatial";
import { isTvBackKey, TV_CHANGE_EVENT } from "@/lib/tv-mode";

const EXPLICIT_ROW =
  ".header-bar, .tv-hero-actions, .tv-row-scroller, .player-actions, .cast-row";
const CANDIDATES = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
const TEXT_TYPES = new Set([
  "",
  "text",
  "search",
  "email",
  "url",
  "password",
  "tel",
  "number",
]);

type Item = { el: HTMLElement; rect: Rect };

function tvOn() {
  return document.documentElement.classList.contains("tv-mode");
}

function isEnter(event: KeyboardEvent) {
  return event.key === "Enter" || event.key === "NumpadEnter" || event.keyCode === 13;
}

function arrowDir(event: KeyboardEvent): Dir | null {
  switch (event.key) {
    case "ArrowLeft":
      return "left";
    case "ArrowRight":
      return "right";
    case "ArrowUp":
      return "up";
    case "ArrowDown":
      return "down";
    default:
      break;
  }
  switch (event.keyCode) {
    case 37:
      return "left";
    case 38:
      return "up";
    case 39:
      return "right";
    case 40:
      return "down";
    default:
      return null;
  }
}

function isTextField(el: EventTarget | null | undefined): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) return TEXT_TYPES.has(el.type);
  return false;
}

function isRange(el: EventTarget | null | undefined): el is HTMLInputElement {
  return el instanceof HTMLInputElement && el.type === "range";
}

function isSelect(el: EventTarget | null | undefined) {
  return el instanceof HTMLSelectElement;
}

function clipped(el: HTMLElement, rect: DOMRect) {
  let node = el.parentElement;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    const clipX = style.overflowX === "hidden" || style.overflowX === "clip";
    const clipY = style.overflowY === "hidden" || style.overflowY === "clip";
    if (clipX || clipY) {
      const box = node.getBoundingClientRect();
      const width = clipX
        ? Math.min(rect.right, box.right) - Math.max(rect.left, box.left)
        : rect.width;
      const height = clipY
        ? Math.min(rect.bottom, box.bottom) - Math.max(rect.top, box.top)
        : rect.height;
      if (width < 8 || height < 8) return true;
    }
    node = node.parentElement;
  }
  return false;
}

function accept(el: HTMLElement) {
  if (!el.isConnected) return false;
  if (el.closest("[data-tv-spatial-skip], [inert]")) return false;
  if (el.getAttribute("tabindex") === "-1") return false;
  if (el.getAttribute("aria-disabled") === "true") return false;

  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    if (node.getAttribute("aria-hidden") === "true") return false;
    const style = getComputedStyle(node);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.visibility === "collapse"
    ) {
      return false;
    }
    node = node.parentElement;
  }

  const own = getComputedStyle(el);
  if (own.pointerEvents === "none" && !el.closest(".player-chrome")) return false;

  const box = el.getBoundingClientRect();
  if (box.width < 8 || box.height < 8) return false;
  if (clipped(el, box)) return false;
  if (box.width > window.innerWidth * 0.85 && box.height > window.innerHeight * 0.4) {
    return false;
  }
  return true;
}

function collect(): Item[] {
  const seen = new Set<HTMLElement>();
  const items: Item[] = [];
  document.querySelectorAll<HTMLElement>(CANDIDATES).forEach((el) => {
    if (seen.has(el) || !accept(el)) return;
    seen.add(el);
    const box = el.getBoundingClientRect();
    items.push({
      el,
      rect: { top: box.top, left: box.left, bottom: box.bottom, right: box.right },
    });
  });
  return items;
}

function build() {
  const items = collect();
  const rects = items.map((item) => item.rect);
  const groups = new Map<HTMLElement, number[]>();
  const loose: number[] = [];

  items.forEach((item, index) => {
    const group = item.el.closest(EXPLICIT_ROW);
    if (group instanceof HTMLElement) {
      const list = groups.get(group);
      if (list) list.push(index);
      else groups.set(group, [index]);
    } else {
      loose.push(index);
    }
  });

  const rows: number[][] = [];
  for (const indices of groups.values()) rows.push(sortWithinRow(indices, rects));
  const looseRects = loose.map((index) => rects[index]);
  for (const group of groupRowIndices(looseRects)) {
    rows.push(group.map((local) => loose[local]));
  }

  rows.sort((a, b) => {
    const top = (row: number[]) => Math.min(...row.map((index) => rects[index].top));
    const left = (row: number[]) => Math.min(...row.map((index) => rects[index].left));
    return top(a) - top(b) || left(a) - left(b);
  });

  return { items, rows };
}

function align(scroller: HTMLElement, el: HTMLElement, axis: "x" | "y", margin: number) {
  const box = el.getBoundingClientRect();
  const view = scroller.getBoundingClientRect();
  if (axis === "x") {
    if (box.left < view.left + margin) {
      scroller.scrollLeft -= view.left + margin - box.left;
    } else if (box.right > view.right - margin) {
      scroller.scrollLeft += box.right - (view.right - margin);
    }
    return;
  }
  if (box.top < view.top + margin) {
    scroller.scrollTop -= view.top + margin - box.top;
  } else if (box.bottom > view.bottom - margin) {
    scroller.scrollTop += box.bottom - (view.bottom - margin);
  }
}

function reveal(el: HTMLElement) {
  const row = el.closest(".tv-row-scroller");
  if (row instanceof HTMLElement) align(row, el, "x", 96);

  let node = el.parentElement;
  while (node && node !== document.documentElement) {
    if (node !== row) {
      const style = getComputedStyle(node);
      const scrollY = style.overflowY === "auto" || style.overflowY === "scroll";
      const scrollX = style.overflowX === "auto" || style.overflowX === "scroll";
      if (scrollY) align(node, el, "y", 28);
      if (scrollX) align(node, el, "x", 28);
    }
    node = node.parentElement;
  }

  const box = el.getBoundingClientRect();
  const topLimit = 130;
  const bottomLimit = window.innerHeight - 72;
  let delta = 0;
  if (box.top < topLimit) delta = box.top - topLimit;
  else if (box.bottom > bottomLimit) delta = box.bottom - bottomLimit;
  if (delta === 0) return;

  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollBy(0, delta);
  root.style.scrollBehavior = previous;
}

function preferred(): HTMLElement | null {
  const play = document.querySelector(".tv-btn-play");
  if (play instanceof HTMLElement) return play;

  const onHome = Boolean(document.querySelector(".tv-home"));
  if (onHome && document.querySelector(".tv-hero-loading")) return null;

  if (!onHome) {
    const back = document.querySelector(".back-link");
    if (back instanceof HTMLElement) return back;
  }

  const card = document.querySelector(".tv-card");
  if (card instanceof HTMLElement) return card;
  if (onHome) return null;

  const nav = document.querySelector(".tv-top-nav a");
  return nav instanceof HTMLElement ? nav : null;
}

export function TvSpatialNav() {
  return (
    <Suspense fallback={null}>
      <TvSpatialNavInner />
    </Suspense>
  );
}

function TvSpatialNavInner() {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useLayoutEffect(() => {
    let column = 0;
    let lastFocused: HTMLElement | null = null;
    let applying = false;
    let userMoved = false;
    let swallowEnterUp = false;
    let lastKeyAt = 0;
    let pointerReady = false;
    let pointerX = 0;
    let pointerY = 0;
    let timer = 0;
    let stopped = false;
    let started = Date.now();

    function clearMark() {
      document.querySelectorAll<HTMLElement>("[data-tv-focused]").forEach((node) => {
        node.removeAttribute("data-tv-focused");
      });
    }

    function focusEl(el: HTMLElement) {
      applying = true;
      try {
        clearMark();
        el.setAttribute("data-tv-focused", "true");
        lastFocused = el;
        if (document.activeElement !== el) {
          try {
            el.focus({ preventScroll: true });
          } catch {
            el.focus();
          }
        }
        reveal(el);
        lastKeyAt = Date.now();
      } finally {
        applying = false;
      }
    }

    function rememberColumn(el: HTMLElement) {
      const { items, rows } = build();
      const pos = locate(
        rows,
        items.findIndex((item) => item.el === el),
      );
      if (pos) column = pos.col;
    }

    function move(dir: Dir) {
      if (lastFocused && !lastFocused.isConnected) lastFocused = null;
      const { items, rows } = build();
      if (items.length === 0) return false;

      const active = document.activeElement;
      let current: HTMLElement | null =
        active instanceof HTMLElement &&
        active !== document.body &&
        active !== document.documentElement
          ? active
          : lastFocused;
      if (current && !items.some((item) => item.el === current)) current = lastFocused;

      const index = current ? items.findIndex((item) => item.el === current) : -1;
      const result = nextTarget(rows, index, dir, column);
      if (result) {
        column = result.column;
        const next = items[result.index]?.el;
        if (next) focusEl(next);
      }
      return true;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (!tvOn()) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (isTvBackKey(event) || event.key === "Escape" || event.keyCode === 27) return;

      const target = event.target instanceof HTMLElement ? event.target : null;
      const active =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (isEnter(event)) {
        if (isTextField(target) || isTextField(active) || isRange(target) || isRange(active)) {
          return;
        }
        if (event.repeat) {
          event.preventDefault();
          return;
        }
        const el =
          active && active !== document.body && active !== document.documentElement
            ? active
            : null;
        if (!el) {
          if (lastFocused?.isConnected) {
            event.preventDefault();
            swallowEnterUp = true;
            userMoved = true;
            focusEl(lastFocused);
          }
          return;
        }
        if (el.matches("a[href], button, [role='button']")) {
          event.preventDefault();
          swallowEnterUp = true;
          userMoved = true;
          el.click();
        }
        return;
      }

      const dir = arrowDir(event);
      if (!dir) return;
      if (isSelect(target) || isSelect(active)) return;
      if ((isTextField(target) || isTextField(active)) && (dir === "left" || dir === "right")) {
        return;
      }
      if ((isRange(target) || isRange(active)) && (dir === "left" || dir === "right")) return;

      userMoved = true;
      if (move(dir)) event.preventDefault();
    }

    function onKeyUp(event: KeyboardEvent) {
      if (!swallowEnterUp || !isEnter(event)) return;
      swallowEnterUp = false;
      if (!tvOn()) return;
      event.preventDefault();
    }

    function onFocusIn(event: FocusEvent) {
      if (applying) return;
      const target = event.target;
      if (!(target instanceof HTMLElement) || target === document.body) return;
      lastFocused = target;
      userMoved = true;
      if (!tvOn()) return;
      rememberColumn(target);
    }

    function onPointerMove(event: PointerEvent) {
      if (!tvOn()) return;
      if (!pointerReady) {
        pointerReady = true;
        pointerX = event.clientX;
        pointerY = event.clientY;
        return;
      }
      const dx = event.clientX - pointerX;
      const dy = event.clientY - pointerY;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (dx * dx + dy * dy < 256) return;
      userMoved = true;
      if (Date.now() - lastKeyAt < 500) return;
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || active === document.body) return;
      const box = active.getBoundingClientRect();
      const over =
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;
      if (over) return;
      active.removeAttribute("data-tv-focused");
      active.blur();
    }

    function tick() {
      if (stopped || userMoved || !tvOn()) return;
      if (isTextField(document.activeElement)) {
        userMoved = true;
        return;
      }
      try {
        window.focus();
      } catch {
        // Some embedded browsers ignore window.focus() without a gesture.
      }
      const target = preferred();
      if (target && document.activeElement !== target) {
        focusEl(target);
        rememberColumn(target);
      }
      if (Date.now() - started < 2500) timer = window.setTimeout(tick, 150);
    }

    function onTvChange() {
      if (stopped || !tvOn()) return;
      userMoved = false;
      started = Date.now();
      window.clearTimeout(timer);
      tick();
    }

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("focusin", onFocusIn, true);
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener(TV_CHANGE_EVENT, onTvChange);
    tick();

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("focusin", onFocusIn, true);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener(TV_CHANGE_EVENT, onTvChange);
    };
  }, [pathname, search]);

  return null;
}
