import Task from "./schema/task.js";
import WbsNode from "./schema/wbs.js";
import Project from "./schema/project.js";
import { Account, Rsrc, TaskRsrc } from "./schema/rsrc.js";
import { Clndr } from "./schema/clndr.js";

const tableIdMap = {
  ACCOUNT: "acct_id",
  CALENDAR: "clndr_id",
  PROJECT: "proj_id",
  PROJWBS: "wbs_id",
  RSRC: "rsrc_id",
  TASK: "task_id",
  TASKRSRC: "taskrsrc_id",
};

const idObjMap = {
  acct_id: Account,
  clndr_id: Clndr,
  proj_id: Project,
  rsrc_id: Rsrc,
  task_id: Task,
  taskrsrc_id: TaskRsrc,
  wbs_id: WbsNode,
};

export function parseTables(data) {
  let tables = {};
  const tableData = data.split("%T\t").slice(1);
  for (let table of tableData) {
    let lines = table.split("\r\n");
    const name = lines.shift().trim();

    if (!(name in tableIdMap)) continue;

    const labels = lines.shift().split("\t").slice(1);
    const rows = lines
      .filter((r) => r.startsWith("%R"))
      .map((r) => zipArraysToObj(labels, r.split("\t").slice(1)));
    tables[name] = convertArrToObj(rows, name);
  }

  for (const node of Object.values(tables.PROJWBS)) {
    if (node.isProjectNode) {
      tables.PROJECT[node.proj_id].wbs = node;
      continue;
    }
    const parentNode = tables.PROJWBS[node.parent_wbs_id];
    parentNode.children.push(node);
    node.parent = parentNode;
  }

  for (const task of Object.values(tables.TASK ?? {})) {
    task.project = tables.PROJECT[task.proj_id];
    task.calendar = tables.CALENDAR[task.clndr_id];
    task.wbs = tables.PROJWBS[task.wbs_id];
    tables.PROJECT[task.proj_id].tasks.push(task);
    tables.PROJWBS[task.wbs_id].tasks.push(task);
  }

  for (const res of Object.values(tables.TASKRSRC ?? {})) {
    res.rsrc = tables.RSRC[res.rsrc_id];
    if (res.acct_id != "" && "ACCOUNT" in tables) {
      res.acct = tables.ACCOUNT[res.acct_id];
    } else {
      res.acct = null;
    }
    tables.TASK[res.task_id].resources.push(res);
  }
  return tables;
}

function zipArraysToObj(labels, arr) {
  let object = labels.reduce((acc, element, i) => {
    return { ...acc, [element]: setDataType(element, arr[i]) };
  }, {});
  return object;
}

const convertArrToObj = (arr, tableName) => {
  const key = tableIdMap[tableName];
  if (!key) return;
  let entries = arr.reduce((obj, el) => {
    if (key in idObjMap) {
      obj[el[key]] = new idObjMap[key](el);
    } else {
      obj[el[key]] = el;
    }
    return obj;
  }, {});
  return entries;
};

const setDataType = (col, val) => {
  if (val === "") return val;
  if (!val || !col) return;
  if (/.+_date2*/.test(col)) return new Date(val.replace(" ", "T"));
  if (col.endsWith("_num")) return parseInt(val);
  if (/.+_(cost|qty|cnt)/.test(col)) return parseFloat(val);
  return val;
};
