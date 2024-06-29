import { pTag, schedLabels } from "./components.js";
import { formatDate } from "./utils.js";
import readFile from "./reader.js";
import { parseTables } from "./parser.js";
import { getProjects } from "./project.js";
import XerError from "./error.js";

const dropArea = document.getElementById("drop-area");
const sched = document.getElementById("sched");

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(
    eventName,
    () => dropArea.classList.add("hover"),
    false
  );
});

["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(
    eventName,
    () => dropArea.classList.remove("hover"),
    false
  );
});

dropArea.addEventListener("drop", handleDrop, false);

async function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  try {
    const data = await readFile(files[0]);
    const tables = parseTables(data);
    const projects = getProjects(tables);

    sched.appendChild(schedLabels());
    for (let proj of projects) {
      createNode(proj.wbs, 0, sched, proj.tasks);
    }
  } catch (err) {
    if (err instanceof XerError) {
      alert(err.message);
    } else {
      console.error(err);
    }
  }
}

function createNode(node, level, parent, tasks) {
  const div = document.createElement("div");
  div.classList.add("node");
  div.classList.add(`l${level}`);
  div.id = node.wbs_id;
  const name = document.createElement("p");
  name.textContent = node.wbs_name;
  div.appendChild(name);

  if (!node.children && !(node.wbs_id in tasks)) {
    return;
  }
  name.classList.add("ctr");
  const childDiv = document.createElement("div");

  if (node.wbs_id in tasks) {
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("tasks");
    for (let task of tasks[node.wbs_id]) {
      const row = document.createElement("div");
      row.classList.add("row");
      row.style.display = "grid";
      row.style.gridTemplateColumns = `${
        230 - level * 10
      }px minmax(300px, 800px) 60px 60px 120px 120px 60px`;
      row.id = task.task_id;
      const taskID = document.createElement("p");
      taskID.textContent = task.task_code;
      taskID.style.paddingLeft = `${70 - level * 10}px`;
      const taskName = document.createElement("p");
      taskName.textContent = task.task_name;
      const origDur = document.createElement("p");
      origDur.textContent = parseInt(parseInt(task.target_drtn_hr_cnt) / 8);
      const remDur = document.createElement("p");
      const remHrs = parseInt(task.remain_drtn_hr_cnt);
      remDur.textContent = remHrs == 0 ? 0 : parseInt(remHrs / 8);
      const startDate = document.createElement("p");
      startDate.textContent = getTaskStart(task);
      const finishDate = document.createElement("p");
      finishDate.textContent = getTaskFinish(task);
      const totalFloat = document.createElement("p");
      const tfHrs = task.total_float_hr_cnt;
      totalFloat.textContent = tfHrs == "" ? "" : parseInt(parseInt(tfHrs) / 8);
      row.appendChild(taskID);
      row.appendChild(taskName);
      row.appendChild(origDur);
      row.appendChild(remDur);
      row.appendChild(startDate);
      row.appendChild(finishDate);
      row.appendChild(totalFloat);

      taskDiv.appendChild(row);
    }
    childDiv.appendChild(taskDiv);
  }

  for (let child of node.children) {
    createNode(child, level + 1, childDiv, tasks);
  }
  div.appendChild(childDiv);
  parent.appendChild(div);

  name.addEventListener("click", function () {
    const content = this.nextElementSibling;
    if (content) {
      content.style.display =
        content.style.display === "none" ? "initial" : "none";
      this.classList.toggle("exp");
      this.classList.toggle("ctr");
    }
  });
}

function getTaskStart(task) {
  if (task.task_type == "TT_FinMile") {
    return "";
  }

  if (task.status_code == "TK_NotStart") {
    return formatDate(task.early_start_date);
  }
  return `${formatDate(task.act_start_date)} A`;
}

function getTaskFinish(task) {
  if (task.task_type == "TT_Mile") {
    return "";
  }

  if (task.status_code == "TK_Complete") {
    return `${formatDate(task.act_end_date)} A`;
  }
  return formatDate(task.early_end_date);
}
