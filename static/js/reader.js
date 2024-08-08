import XerError from "./error.js";

const CODEC = "cp1252";

/**
 * Read the contents of an xer file into a string.
 * @param {Blob} file xer file
 * @returns {string} Contents of an xer file
 */
export default async function readFile(file) {
  if (!file.name.endsWith(".xer")) throw new XerError("Not an XER File");
  let reader = new FileReader();
  reader.readAsText(file, CODEC);
  await new Promise((resolve) => (reader.onload = () => resolve()));
  const results = reader.result;
  if (!results.startsWith("ERMHDR")) throw new XerError("Invalid XER File");
  return results;
}
