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

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  readFile(files[0]);
}

function readFile(file) {
  if (!file.name.endsWith(".xer")) return null;

  let reader = new FileReader();
  reader.onload = (r) => {
    let projects = processProj(parseTables(r.target.result));

    let colsDiv = document.createElement("div");
    colsDiv.id = "col-header";
    colsDiv.style.display = "grid";
    colsDiv.style.gridTemplateColumns = `240px minmax(300px, 800px) 60px 60px 120px 120px 60px`;
    const idCol = document.createElement("p");
    idCol.textContent = "Activity ID";
    idCol.style.paddingLeft = `10px`;
    const nameCol = document.createElement("p");
    nameCol.textContent = "Activity Name";
    const odCol = document.createElement("p");
    odCol.textContent = "Orig Dur";
    const rdCol = document.createElement("p");
    rdCol.textContent = "Rem Dur";
    const startCol = document.createElement("p");
    startCol.textContent = "Start";
    const finishCol = document.createElement("p");
    finishCol.textContent = "Finish";
    const tfCol = document.createElement("p");
    tfCol.textContent = "Total Float";
    colsDiv.appendChild(idCol);
    colsDiv.appendChild(nameCol);
    colsDiv.appendChild(odCol);
    colsDiv.appendChild(rdCol);
    colsDiv.appendChild(startCol);
    colsDiv.appendChild(finishCol);
    colsDiv.appendChild(tfCol);

    colsDiv.style.border = "1px solid #999";
    sched.appendChild(colsDiv);

    for (proj of projects) {
      createNode(proj.wbs, 0, sched, proj.tasks);
    }
  };
  reader.readAsText(file, "cp1252");
}

function parseTables(data) {
  let tables = {};
  const tableData = data.split("%T\t").slice(1);
  for (let table of tableData) {
    let lines = table.split("\r\n");
    const name = lines.shift().trim();
    const labels = lines.shift().split("\t").slice(1);
    const rows = lines
      .filter((r) => r.startsWith("%R"))
      .map((r) => r.split("\t").slice(1));
    tables[name] = rows.map((row) => convertToObj(labels, row));
  }
  return tables;
}

function processProj(data) {
  let validProjs = data.PROJECT.filter((p) => p.export_flag == "Y");
  for (proj of validProjs) {
    proj.wbs = processWBS(data.PROJWBS, proj.proj_id);
    proj.tasks = processTask(data.TASK, proj.proj_id);
  }
  return validProjs;
}

function processWBS(wbsData, proj_id) {
  let projWbs = wbsData.filter((n) => n.proj_id == proj_id);
  let projNode = getProjNode(projWbs, proj_id);
  let wbs = processNode(projNode, projWbs);

  return wbs;
}

function processNode(node, wbsData) {
  node.children = [];
  node.tasks = [];
  for (wbs of wbsData) {
    if (wbs.parent_wbs_id == node.wbs_id) {
      node.children.push(wbs);
      processNode(wbs, wbsData);
    }
  }
  return node;
}

function getProjNode(wbsData, proj_id) {
  for (node of wbsData) {
    if (node.proj_node_flag == "Y" && node.proj_id == proj_id) {
      return node;
    }
    return null;
  }
}

function processTask(taskData, proj_id) {
  let tasks = {};
  for (let task of taskData.filter((t) => t.proj_id == proj_id)) {
    if (!(task.wbs_id in tasks)) {
      tasks[task.wbs_id] = [];
    }
    tasks[task.wbs_id].push(task);
  }
  return tasks;
}

function convertToObj(a, b) {
  let object = a.reduce((acc, element, index) => {
    return { ...acc, [element]: b[index] };
  }, {});
  return object;
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

  for (child of node.children) {
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

function formatDate(date) {
  const parts = date.split(/[- :]/); // Split by hyphens, spaces, and colons
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${parts[2]}-${months[parseInt(parts[1]) - 1]}-${parts[0].slice(-2)}`;
}
