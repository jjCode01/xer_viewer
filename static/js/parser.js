export function parseTables(data) {
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

function convertToObj(labels, arr) {
  let object = labels.reduce((acc, element, i) => {
    return { ...acc, [element]: setDataType(element, arr[i]) };
  }, {});
  return object;
}

const setDataType = (col, val) => {
  if (val === "") return val;
  if (!val || !col) return;
  if (/.+_date2*/.test(col)) return new Date(val.replace(" ", "T"));
  if (col.endsWith("_num")) return parseInt(val);
  if (/.+_(cost|qty|cnt)/.test(col)) return parseFloat(val);
  return val;
};
