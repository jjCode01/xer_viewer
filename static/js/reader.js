import XerError from "./error.js";

const CODEC = "cp1252";

export default async function readFile(file) {
  if (!file.name.endsWith(".xer")) throw new XerError("Not an XER File");
  let reader = new FileReader();
  reader.readAsText(file, CODEC);
  await new Promise((resolve) => (reader.onload = () => resolve()));
  const results = reader.result;
  if (!results.startsWith("ERMHDR")) throw new XerError("Invalid XER File");
  return results;
}
