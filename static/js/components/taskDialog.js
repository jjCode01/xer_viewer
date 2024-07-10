import { taskTypes, percentTypes, durationType } from "../enums.js";
import { formatCost, formatNumber } from "../utils.js";

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

const rsrcTable = document.getElementById("task-resources");

export function updateTaskDialog(task) {
  updateGeneralTab(task);
  updateStatusTab(task);
  updateRsrcTab(task);
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

function updateRsrcTab(task) {
  const children = rsrcTable.children;

  for (let i = children.length - 1; i >= 0; i--) {
    if (children[i].classList.contains("cell")) {
      rsrcTable.removeChild(children[i]);
    }
  }
  for (const res of task.resources) {
    rsrcTable.appendChild(
      makeDiv(res.rsrc.rsrc_name, { borderRight: "1px solid #999" })
    );
    rsrcTable.appendChild(
      makeDiv(res.acct?.acct_name ?? "", { borderRight: "1px solid #999" })
    );
    rsrcTable.appendChild(
      makeDiv(formatCost(res.target_cost), {
        borderRight: "1px solid #999",
        textAlign: "right",
      })
    );
    rsrcTable.appendChild(
      makeDiv(formatCost(res.actualCost), {
        borderRight: "1px solid #999",
        textAlign: "right",
      })
    );
    rsrcTable.appendChild(
      makeDiv(formatCost(res.remain_cost), {
        borderRight: "1px solid #999",
        textAlign: "right",
      })
    );
    rsrcTable.appendChild(
      makeDiv(formatNumber(res.target_qty) + "h", {
        borderRight: "1px solid #999",
        textAlign: "right",
      })
    );
    rsrcTable.appendChild(
      makeDiv(formatNumber(res.actualQty) + "h", {
        borderRight: "1px solid #999",
        textAlign: "right",
      })
    );
    rsrcTable.appendChild(
      makeDiv(formatNumber(res.remain_qty) + "h", {
        textAlign: "right",
      })
    );
  }
}

function makeDiv(val, args = {}) {
  const div = document.createElement("div");
  div.classList.add("cell");
  div.textContent = val;

  for (const arg in args) {
    div.style[arg] = args[arg];
  }
  return div;
}
