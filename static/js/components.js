export const pTag = (text, fmt = {}) => {
  const p = document.createElement("p");
  p.textContent = text;
  for (let opt in fmt) {
    p.style[opt] = fmt[opt];
  }
  return p;
};

export const schedLabels = () => {
  const defaultLabels = [
    "Activity ID",
    "Activity Name",
    "Orig Dur",
    "Rem Dur",
    "Start",
    "Finish",
    "Total Float",
  ];

  const defualtWidths = [
    "240px",
    "minmax(300px, auto)",
    "60px",
    "60px",
    "120px",
    "120px",
    "60px",
  ];

  const div = document.createElement("div");
  div.id = "col-header";
  div.style.display = "grid";
  //   div.style.gridTemplateColumns = `240px minmax(300px, auto) 60px 60px 120px 120px 60px`;
  div.style.gridTemplateColumns = `${defualtWidths.join(" ")}`;

  for (let label of defaultLabels) {
    div.appendChild(pTag(label));
  }

  div.style.border = "1px solid #999";
  return div;
};
