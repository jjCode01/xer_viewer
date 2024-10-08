import Task from "./schema/task.js";
import WbsNode from "./schema/wbs.js";
import Project from "./schema/project.js";
import { Account, Rsrc, TaskRsrc } from "./schema/rsrc.js";
import { Clndr } from "./schema/clndr.js";
import { TaskPred } from "./schema/taskpred.js";
import { ActvCode, ActvType } from "./schema/actvCodes.js";
import { MemoType, TaskMemo, WbsMemo } from "./schema/memo.js";

const tableIdMap = {
  ACCOUNT: "acct_id",
  ACTVCODE: "actv_code_id",
  ACTVTYPE: "actv_code_type_id",
  CALENDAR: "clndr_id",
  MEMOTYPE: "memo_type_id",
  PROJECT: "proj_id",
  PROJWBS: "wbs_id",
  RSRC: "rsrc_id",
  TASK: "task_id",
  TASKACTV: null,
  TASKMEMO: "memo_id",
  TASKRSRC: "taskrsrc_id",
  TASKPRED: "task_pred_id",
  WBSMEMO: "wbs_memo_id",
};

const idObjMap = {
  acct_id: Account,
  actv_code_id: ActvCode,
  actv_code_type_id: ActvType,
  clndr_id: Clndr,
  memo_id: TaskMemo,
  memo_type_id: MemoType,
  proj_id: Project,
  rsrc_id: Rsrc,
  task_id: Task,
  taskrsrc_id: TaskRsrc,
  task_pred_id: TaskPred,
  wbs_id: WbsNode,
  wbs_memo_id: WbsMemo,
};

/**
 * Convert the text data from an xer file into a key-value pair object
 * with the table name as the key and the table entries as the value.
 * @param {string} data tab delimited text from an xer file.
 * @returns Tables included in the xer file as Objects
 * with the key being the table name and entries as the data
 */
export function parseTables(data) {
  let tables = {};

  // The start of a table is prefixed with a '%T'
  const tableDelimiter = "%T\t";
  const rowDelimiter = "\r\n";

  // The first row will be data about the file and not a table, so it can be discarded
  const tableData = data.split(tableDelimiter).slice(1);
  for (let table of tableData) {
    let lines = table.split(rowDelimiter);
    const name = lines.shift().trim();

    if (!(name in tableIdMap)) continue;
    const key = tableIdMap[name];
    const labels = lines.shift().split("\t").slice(1);
    const rows = parseRows(labels, lines);
    if (key) {
      tables[name] = convertArrToObj(rows, key);
    } else {
      tables[name] = rows;
    }
  }

  processWbsNodes(tables);
  processTasks(tables);
  processTaskRsrcs(tables);
  processTaskPreds(tables);
  processActivityCodes(tables);
  processMemos(tables);
  return tables;
}

/**
 * Transform table entries from a tab delimited string to an Array of key-value pairs.
 * @param {string[]} labels Array of data labels (i.e. column headers)
 * @param {string} data Table entries as a single string of tab delimited text
 * @returns {Object[]} A list of table entries as key-value pairs
 */
function parseRows(labels, data) {
  const filteredData = data.filter((row) => row.startsWith("%R"));
  const rows = filteredData.map((row) =>
    zipArrays(labels, row.split("\t").slice(1))
  );
  return rows;
}

/**
 * Combine two arrays into an `Object` where `arr1` holds the keys and `arr2` holds the values.
 * @example <caption>Eample usage of zipArrays.</caption>
 * zipArrays(["A", "B", "C"], [1, 2, 3])
 * // returns {A: 1, B: 2, C: 3}
 * @param {string[]} arr1 Array of keys
 * @param {any[]} arr2 Array of values
 * @returns {Object} Two arrays combined into an `Object`.
 */
function zipArrays(arr1, arr2) {
  let object = arr1.reduce((acc, element, i) => {
    return { ...acc, [element]: setDataType(element, arr2[i]) };
  }, {});
  return object;
}

/**
 * Convert an array of Objects to an Object with their unique table id as their key.
 * @param {Object[]} arr
 * @param {string} key Name of unique key for table entries
 * @returns Table entries as an object their unique table id as the key.
 */
const convertArrToObj = (arr, key) => {
  if (!key) return;
  let entries = arr.reduce((obj, entry) => {
    if (key in idObjMap) {
      obj[entry[key]] = new idObjMap[key](entry);
    } else {
      obj[entry[key]] = entry;
    }
    return obj;
  }, {});
  return entries;
};

/**
 * Transform a string value to an integer, float, or date object based on the column label.
 * @param {string} col column label for data entry
 * @param {string} val string value of data entry
 * @returns {any} Transformed `string` value based on column label.
 */
const setDataType = (col, val) => {
  if (val === "") return val;
  if (!val || !col) return;
  if (/.+_date2*/.test(col)) return new Date(val.replace(" ", "T"));
  if (col.endsWith("_num")) return parseInt(val);
  if (/.+_(cost|qty|cnt)/.test(col)) return parseFloat(val);
  return val;
};

/**
 * Assign parent and children of each `WbsNode`.
 * @param {Object} tables All tables parsed from the xer file
 */
function processWbsNodes(tables) {
  for (const node of Object.values(tables.PROJWBS)) {
    node.project = tables.PROJECT[node.proj_id];
    if (node.isProjectNode) {
      node.project.wbs = node;
      continue;
    }
    node.parent = tables.PROJWBS[node.parent_wbs_id];
    node.parent.children.push(node);
  }
}

function processTasks(tables) {
  for (const task of Object.values(tables.TASK ?? {})) {
    task.project = tables.PROJECT[task.proj_id];
    task.project.tasks.push(task);
    task.calendar = tables.CALENDAR[task.clndr_id];
    task.wbs = tables.PROJWBS[task.wbs_id];
    task.wbs.tasks.push(task);
  }
}

function processTaskRsrcs(tables) {
  for (const res of Object.values(tables.TASKRSRC ?? {})) {
    res.rsrc = tables.RSRC[res.rsrc_id];
    if (res.acct_id != "" && "ACCOUNT" in tables) {
      res.acct = tables.ACCOUNT[res.acct_id];
    } else {
      res.acct = null;
    }
    tables.PROJECT[res.proj_id].resources.push(res);
    tables.TASK[res.task_id].resources.push(res);
  }
}

function processTaskPreds(tables) {
  for (const rel of Object.values(tables.TASKPRED ?? {})) {
    const proj = tables.PROJECT[rel.proj_id];
    proj.relationships.push(rel);
    rel.predecessor = tables.TASK[rel.pred_task_id];
    rel.successor = tables.TASK[rel.task_id];
    rel.predecessor.successors.push(rel);
    rel.successor.predecessors.push(rel);
  }
}

function processActivityCodes(tables) {
  for (const code of Object.values(tables.ACTVCODE ?? {})) {
    code.actvType = tables.ACTVTYPE[code.actv_code_type_id];
    code.actvType.addCode(code);
  }

  for (const taskCode of tables.TASKACTV ?? []) {
    const task = tables.TASK[taskCode.task_id];
    const code = tables.ACTVCODE[taskCode.actv_code_id];
    task.codes.push(code);
  }
}

function processMemos(tables) {
  for (const memo of Object.values(tables.TASKMEMO ?? {})) {
    memo.memoType = tables.MEMOTYPE[memo.memo_type_id];
    memo.task = tables.TASK[memo.task_id];
    memo.task.memos.push(memo);
  }
}
