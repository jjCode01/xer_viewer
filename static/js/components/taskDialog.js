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
  //   taskName.textContent = task.task_name;
  activityType.textContent = taskTypes[task.task_type];
  taskDurationType.textContent =
    durationType[task.duration_type] ?? task.duration_type;
  percentType.textContent = percentTypes[task.complete_pct_type];
  calendar.textContent = task.calendar.clndr_name;
  wbsCode.textContent = task.wbs.code;
}

function updateStatusTab(task) {
  origDur.textContent = parseInt(task.target_drtn_hr_cnt / 8);
  // TODO: Calculate Actual Duration
  remDur.textContent = parseInt(task.remain_drtn_hr_cnt / 8);
  // TODO: Calculate At Complete Duration
}
