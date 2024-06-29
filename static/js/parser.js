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

function convertToObj(a, b) {
  let object = a.reduce((acc, element, index) => {
    return { ...acc, [element]: b[index] };
  }, {});
  return object;
}
