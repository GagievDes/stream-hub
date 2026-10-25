export type Rect = {
  top: number;
  left: number;
  bottom: number;
  right: number;
};

export type Dir = "left" | "right" | "up" | "down";

const ROW_OVERLAP = 0.45;
const WRAP_TOP = 24;

function height(rect: Rect) {
  return rect.bottom - rect.top;
}

function overlapRatio(a: Rect, b: Rect) {
  const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  if (overlap <= 0) return 0;
  const minHeight = Math.min(height(a), height(b));
  if (minHeight <= 0) return 0;
  return overlap / minHeight;
}

export function sortWithinRow(indices: number[], rects: readonly Rect[]): number[] {
  return [...indices].sort((a, b) => {
    const ra = rects[a];
    const rb = rects[b];
    if (!ra || !rb) return 0;
    if (Math.abs(ra.top - rb.top) > WRAP_TOP) {
      return ra.top - rb.top || ra.left - rb.left;
    }
    return ra.left - rb.left || ra.top - rb.top;
  });
}

/** Group rectangles into horizontal rows by vertical overlap. */
export function groupRowIndices(rects: readonly Rect[]): number[][] {
  const order = rects
    .map((_, index) => index)
    .sort((a, b) => rects[a].top - rects[b].top || rects[a].left - rects[b].left);
  const rows: number[][] = [];

  for (const index of order) {
    const rect = rects[index];
    let placed = false;
    for (const row of rows) {
      const overlaps = row.some((member) => {
        const other = rects[member];
        return other ? overlapRatio(rect, other) >= ROW_OVERLAP : false;
      });
      if (!overlaps) continue;
      row.push(index);
      placed = true;
      break;
    }
    if (!placed) rows.push([index]);
  }

  const sorted = rows.map((row) => sortWithinRow(row, rects));
  sorted.sort((a, b) => {
    const topA = Math.min(...a.map((index) => rects[index].top));
    const topB = Math.min(...b.map((index) => rects[index].top));
    return topA - topB;
  });
  return sorted;
}

export function locate(
  rows: readonly number[][],
  index: number,
): { row: number; col: number } | null {
  if (index < 0) return null;
  for (let row = 0; row < rows.length; row += 1) {
    const col = rows[row].indexOf(index);
    if (col >= 0) return { row, col };
  }
  return null;
}

function clampCol(column: number, length: number) {
  if (length <= 0) return 0;
  return Math.min(Math.max(column, 0), length - 1);
}

/**
 * Move within pre-grouped rows.
 * Left/right stay on the row and update `column`.
 * Up/down keep `column` so a short row does not forget the poster index.
 * Returns null at a row edge (caller still treats the key as handled).
 */
export function nextTarget(
  rows: readonly number[][],
  currentIndex: number,
  dir: Dir,
  column: number,
): { index: number; column: number } | null {
  if (rows.length === 0) return null;
  const pos = locate(rows, currentIndex);

  if (!pos) {
    const rowIndex = dir === "up" ? rows.length - 1 : 0;
    const row = rows[rowIndex];
    if (!row || row.length === 0) return null;
    return { index: row[clampCol(column, row.length)], column };
  }

  const row = rows[pos.row];
  if (dir === "left" || dir === "right") {
    const nextCol = pos.col + (dir === "right" ? 1 : -1);
    if (!row || nextCol < 0 || nextCol >= row.length) return null;
    return { index: row[nextCol], column: nextCol };
  }

  const nextRow = rows[pos.row + (dir === "down" ? 1 : -1)];
  if (!nextRow || nextRow.length === 0) return null;
  const index = nextRow[clampCol(column, nextRow.length)];
  if (index === currentIndex) return null;
  return { index, column };
}
