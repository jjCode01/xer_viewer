import { formatCost, formatDate, formatNumber } from "../utils.js";
import pTag from "./pTag.js";

const DEFAULTWIDTHS = [
  "240px",
  "minmax(300px, auto)",
  "55px",
  "55px",
  "105px",
  "105px",
  "55px",
  "140px",
];

const DEFAULTLABELS = [
  "Activity ID",
  "Activity Name",
  "Orig Dur",
  "Rem Dur",
  "Start",
  "Finish",
  "Total Float",
  "Budgeted Cost",
];

export const schedLabels = (hasCost = false) => {
  const div = document.createElement("div");
  div.id = "col-header";
  div.style.display = "grid";
  if (hasCost) {
    div.style.gridTemplateColumns = `${DEFAULTWIDTHS.join(" ")}`;
  } else {
    div.style.gridTemplateColumns = `${DEFAULTWIDTHS.slice(0, -1).join(" ")}`;
  }

  for (let label of hasCost ? DEFAULTLABELS : DEFAULTLABELS.slice(0, -1)) {
    div.appendChild(pTag(label));
  }

  div.style.borderLeft = "1px solid #999";
  div.style.borderTop = "1px solid #999";

  return div;
};

export const taskTable = (tasks, level, hasCost = false) => {
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
    const idColWidth = 229 - level * 11;
    const row = taskRow(idColWidth, task.task_id, hasCost);

    const taskCode = pTag(task.task_code, {
      paddingLeft: "10px",
    });

    row.appendChild(taskCode);
    row.appendChild(pTag(task.task_name));
    row.appendChild(pTag(formatNumber(task.origDur)));
    row.appendChild(pTag(formatNumber(task.remDur)));
    row.appendChild(pTag(taskStart(task)));
    row.appendChild(pTag(taskFinish(task)));
    row.appendChild(pTag(isNaN(task.totalFloat) ? "" : task.totalFloat));
    if (hasCost) {
      row.appendChild(
        pTag(formatCost(task.budgetCost), { textAlign: "right" })
      );
    }
    div.appendChild(row);
  }
  return div;
};

const taskStart = (task) => {
  if (task.task_type == "TT_FinMile") return "";
  return `${formatDate(task.start)}${task.notStarted ? "" : " A"}`;
};

const taskFinish = (task) => {
  if (task.task_type == "TT_Mile") return "";
  return `${formatDate(task.finish)}${task.completed ? " A" : ""}`;
};

const taskRow = (col1Width, id, hasCost) => {
  const row = document.createElement("div");
  row.classList.add("task");
  if (hasCost) {
    row.style.gridTemplateColumns = [
      `${col1Width}px`,
      ...DEFAULTWIDTHS.slice(1),
    ].join(" ");
  } else {
    row.style.gridTemplateColumns = [
      `${col1Width}px`,
      ...DEFAULTWIDTHS.slice(1, -1),
    ].join(" ");
  }

  row.id = id;
  return row;
};
