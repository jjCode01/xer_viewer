const tableIdMap = {
  PROJECT: "proj_id",
  PROJWBS: "wbs_id",
  TASK: "task_id",
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
    tables[name] = toObject(rows, name);
  }

  for (const node of Object.values(tables.PROJWBS)) {
    if (node.proj_node_flag === "Y") {
      tables.PROJECT[node.proj_id].wbs = node;
      continue;
    }
    tables.PROJWBS[node.parent_wbs_id].children.push(node);
  }

  for (const task of Object.values(tables.TASK)) {
    tables.PROJWBS[task.wbs_id].tasks.push(task);
  }
  console.log(tables);
  return tables;
}

function zipArraysToObj(labels, arr) {
  let object = labels.reduce((acc, element, i) => {
    return { ...acc, [element]: setDataType(element, arr[i]) };
  }, {});
  return object;
}

const toObject = (arr, tableName) => {
  const key = tableIdMap[tableName];
  if (!key) return;
  let entries = arr.reduce((obj, el) => {
    if (tableName === "PROJWBS") {
      el.children = [];
      el.tasks = [];
    }
    if (tableName === "TASK") {
      el.search = getSearch(el);
    }
    obj[el[key]] = el;
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

const getSearch = (task) => {
  const searchAttrs = [
    task.task_code,
    task.task_name,
    task.driving_path_flag === "Y" ? "Critical" : "",
  ];
  return searchAttrs.join(" ");
};
