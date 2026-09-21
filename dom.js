// Tiny DOM helpers shared by the landing page and the team console.

const SVG_NS = "http://www.w3.org/2000/svg";

export const $ = (selector, root = document) => root.querySelector(selector);

// Element builder. Text always goes through textContent, so user input is never parsed as HTML.
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    if (key === "class") el.className = value;
    else if (key === "text") el.textContent = value;
    else if (key.startsWith("on")) el.addEventListener(key.slice(2), value);
    else el.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat()) if (child != null) el.append(child.nodeType ? child : document.createTextNode(child));
  return el;
}

// Uses the <symbol> sprite at the top of each page.
export function icon(name) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", `#i-${name}`);
  svg.append(use);
  return svg;
}

// Copy to clipboard, or select the fallback element's text when the browser blocks it.
export async function copyText(text, fallbackEl, statusEl, okMessage) {
  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = okMessage;
  } catch {
    const range = document.createRange();
    range.selectNodeContents(fallbackEl);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    statusEl.textContent = "Copy was blocked by your browser. The text is selected, so press copy on your keyboard.";
  }
}
