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
const totalFloat = document.getElementById("total-float");
const freeFloat = document.getElementById("free-float");

const rsrcTable = document.getElementById("task-resources");

const predTable = document.getElementById("task-predecessors");
const succTable = document.getElementById("task-successors");

export function updateTaskDialog(task) {
  updateGeneralTab(task);
  updateStatusTab(task);
  updateRsrcTab(task);
  updatePredTab(task);
  updateSuccTab(task);
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
  totalFloat.textContent = isNaN(task.totalFloat) ? "" : task.totalFloat;
  freeFloat.textContent = isNaN(task.freeFloat) ? "" : task.freeFloat;
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

function updatePredTab(task) {
  deleteCells(predTable);
  for (const pred of task.predecessors) {
    predTable.appendChild(
      makeDiv(pred.predecessor.task_code, { borderRight: "1px solid #999" })
    );
    predTable.appendChild(
      makeDiv(pred.predecessor.task_name, { borderRight: "1px solid #999" })
    );
    predTable.appendChild(
      makeDiv(pred.link, { borderRight: "1px solid #999", textAlign: "center" })
    );
    predTable.appendChild(makeDiv(pred.lag, { textAlign: "center" }));
  }
}

function updateSuccTab(task) {
  deleteCells(succTable);
  for (const pred of task.successors) {
    succTable.appendChild(
      makeDiv(pred.successor.task_code, { borderRight: "1px solid #999" })
    );
    succTable.appendChild(
      makeDiv(pred.successor.task_name, { borderRight: "1px solid #999" })
    );
    succTable.appendChild(
      makeDiv(pred.link, { borderRight: "1px solid #999", textAlign: "center" })
    );
    succTable.appendChild(makeDiv(pred.lag, { textAlign: "center" }));
  }
}

function deleteCells(el) {
  const children = el.children;
  for (let i = children.length - 1; i >= 0; i--) {
    if (children[i].classList.contains("cell")) {
      el.removeChild(children[i]);
    }
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
