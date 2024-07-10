import { taskTypes, percentTypes, durationType } from "../enums.js";

const taskCode = document.getElementById("task-code");
const taskName = document.getElementById("task-name");

const activityType = document.getElementById("activity-type");
const taskDurationType = document.getElementById("duration-type");
const percentType = document.getElementById("percent-type");
const calendar = document.getElementById("calendar");
const wbsCode = document.getElementById("wbs-code");

const origDur = document.getElementById("original-dur");
const actDur = document.getElementById("actual-dur");
const remDur = document.getElementById("remain-dur");
const atCompDur = document.getElementById("at-complete-dur");

export function updateTaskDialog(task) {
  updateGeneralTab(task);
  updateStatusTab(task);
}

function updateGeneralTab(task) {
  taskCode.textContent = `${task.task_code} - ${task.task_name}`;
  activityType.textContent = taskTypes[task.task_type];
  taskDurationType.textContent =
    durationType[task.duration_type] ?? task.duration_type;
  percentType.textContent = percentTypes[task.complete_pct_type];
  calendar.textContent = task.calendar.clndr_name;
  wbsCode.textContent = task.wbs.code;
}

function updateStatusTab(task) {
  origDur.textContent = task.origDur;
  actDur.textContent = task.actualDuration();
  remDur.textContent = task.remDur;
  atCompDur.textContent = task.actualDuration() + task.remDur;
}
