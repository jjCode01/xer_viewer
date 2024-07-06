import { formatDate, formatNumber } from "./utils.js";

const DEFAULTWIDTHS = [
  "240px",
  "minmax(300px, auto)",
  "60px",
  "60px",
  "120px",
  "120px",
  "60px",
];

const DEFAULTLABELS = [
  "Activity ID",
  "Activity Name",
  "Orig Dur",
  "Rem Dur",
  "Start",
  "Finish",
  "Total Float",
];

export const pTag = (text, fmt = {}) => {
  const p = document.createElement("p");
  p.textContent = text;
  for (let opt in fmt) {
    p.style[opt] = fmt[opt];
  }
  return p;
};

export const schedLabels = () => {
  const div = document.createElement("div");
  div.id = "col-header";
  div.style.display = "grid";
  div.style.gridTemplateColumns = `${DEFAULTWIDTHS.join(" ")}`;

  for (let label of DEFAULTLABELS) {
    div.appendChild(pTag(label));
  }

  div.style.border = "1px solid #999";
  return div;
};

export const taskTable = (tasks, level) => {
  const div = document.createElement("div");
  div.classList.add("tasks");
  const sortedTasks = tasks.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    } else {
      return a.finish - b.finish;
    }
  });
  for (let task of sortedTasks) {
    const idColWidth = 230 - level * 10;
    const row = taskRow(idColWidth, task.task_id);

    const taskCode = pTag(task.task_code, {
      paddingLeft: `${70 - level * 10}px`,
    });

    row.appendChild(taskCode);
    row.appendChild(pTag(task.task_name));
    row.appendChild(pTag(formatNumber(task.origDur)));
    row.appendChild(pTag(formatNumber(task.remDur)));
    row.appendChild(pTag(taskStart(task)));
    row.appendChild(pTag(taskFinish(task)));
    row.appendChild(pTag(isNaN(task.totalFloat) ? "" : task.totalFloat));
    div.appendChild(row);
  }
  return div;
};

const taskStart = (task) => {
  if (task.task_type == "TT_Mile") return "";
  return `${formatDate(task.start)}${task.notStarted ? "" : " A"}`;
};

const taskFinish = (task) => {
  if (task.task_type == "TT_FinMile") return "";
  return `${formatDate(task.finish)}${task.completed ? " A" : ""}`;
};

const taskRow = (col1Width, id) => {
  const row = document.createElement("div");
  row.classList.add("task");
  row.style.gridTemplateColumns = [
    `${col1Width}px`,
    ...DEFAULTWIDTHS.slice(1),
  ].join(" ");

  row.id = id;
  return row;
};
