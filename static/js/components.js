import { getTaskFinish, getTaskStart, getTotalFloat } from "./task.js";

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
    if (taskStart(a) !== taskStart(b)) {
      return taskStart(a) - taskStart(b);
    } else {
      return taskFinish(a) - taskFinish(b);
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
    row.appendChild(pTag(parseInt(task.target_drtn_hr_cnt / 8)));
    row.appendChild(pTag(parseInt(task.remain_drtn_hr_cnt / 8)));
    row.appendChild(pTag(getTaskStart(task)));
    row.appendChild(pTag(getTaskFinish(task)));
    row.appendChild(pTag(getTotalFloat(task)));
    div.appendChild(row);
  }
  return div;
};

const taskStart = (task) => {
  if (task.status_code == "TK_NotStart") {
    return task.early_start_date;
  }
  return task.act_start_date;
};

const taskFinish = (task) => {
  if (task.status_code == "TK_Complete") {
    return task.act_end_date;
  }
  return task.early_end_date;
};

const taskRow = (col1Width, id) => {
  const row = document.createElement("div");
  row.classList.add("row");
  row.style.display = "grid";
  row.style.gridTemplateColumns = [
    `${col1Width}px`,
    ...DEFAULTWIDTHS.slice(1),
  ].join(" ");

  row.id = id;
  return row;
};
