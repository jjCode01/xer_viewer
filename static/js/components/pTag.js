export default function pTag(text, fmt = {}) {
  const p = document.createElement("p");
  p.textContent = text;
  for (let opt in fmt) {
    p.style[opt] = fmt[opt];
  }
  return p;
}
