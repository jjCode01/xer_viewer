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

const codeTable = document.getElementById("task-codes");

const notebooks = document.getElementById("notebooks");
const memos = document.getElementById("memos");

export function updateTaskDialog(task) {
  updateGeneralTab(task);
  updateStatusTab(task);
  updateRsrcTab(task);
  updatePredTab(task);
  updateSuccTab(task);
  updateCodeTab(task);
  updateMemoTab(task);
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

function updateCodeTab(task) {
  deleteCells(codeTable);
  for (const code of task.codes) {
    codeTable.appendChild(
      makeDiv(code.actvType.actv_code_type, { borderRight: "1px solid #999" })
    );
    codeTable.appendChild(
      makeDiv(code.short_name, { borderRight: "1px solid #999" })
    );
    codeTable.appendChild(makeDiv(code.actv_code_name));
  }
}

function updateMemoTab(task) {
  deleteCells(notebooks);
  deleteCells(memos);
  for (const memo in task.memos) {
    const nbDiv = makeDiv(task.memos[memo].memoType.memo_type);
    nbDiv.classList.add("cell");
    nbDiv.classList.add("nb");
    nbDiv.id = task.memos[memo].memoType.memo_type;
    notebooks.appendChild(nbDiv);

    nbDiv.addEventListener("click", () => {
      deleteCells(memos);
      const allNbs = document.querySelectorAll(".nb");
      allNbs.forEach((nb) => nb.classList.remove("selected"));
      nbDiv.classList.add("selected");
      const memoDiv = document.createElement("div");
      memoDiv.classList.add("cell");
      const memoHTML = new DOMParser().parseFromString(
        task.memos[memo].task_memo,
        "text/html"
      );

      memoDiv.innerHTML = memoHTML.lastChild.innerHTML;
      memoDiv.style.padding = "10px";
      memoDiv.style.border = 0;
      memos.appendChild(memoDiv);
    });
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
