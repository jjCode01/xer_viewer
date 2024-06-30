import { schedLabels, taskTable } from "./components.js";
import readFile from "./reader.js";
import { parseTables } from "./parser.js";
import { getProjects } from "./project.js";
import XerError from "./error.js";

const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
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

dropArea.addEventListener("drop", (event) => {
  const files = event.dataTransfer.files;
  handleDrop(files);
});

dropArea.addEventListener("click", (event) => {
  if (!event.dataTransfer) {
    // Check if there was no drag event
    fileInput.click();
  }
});

// Handle file selection from the hidden file input
fileInput.addEventListener("change", (event) => {
  const files = event.target.files;
  handleDrop(files);
});

async function handleDrop(files) {
  try {
    const data = await readFile(files[0]);
    const tables = parseTables(data);
    const projects = getProjects(tables);

    sched.appendChild(schedLabels());
    for (let proj of projects) {
      createNode(proj.wbs, 0, sched, proj.tasks);
    }
    dropArea.style.display = "none";
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
    childDiv.appendChild(taskTable(tasks[node.wbs_id], level));
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
