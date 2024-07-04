import { schedLabels, taskTable } from "./components.js";
import readFile from "./reader.js";
import { parseTables } from "./parser.js";
import XerError from "./error.js";

const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
const sched = document.getElementById("sched");
const searchInput = document.getElementById("search-input");

let xer = undefined;

[("dragenter", "dragover", "dragleave", "drop")].forEach((eventName) => {
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

searchInput.addEventListener("input", () => {
  const taskItems = document.querySelectorAll(".task");

  const searchTerm = searchInput.value.toLowerCase();

  filterTasks(searchTerm);
});

function isEmptyNode(node) {
  if (node.tasks.length > 0) return false;

  for (const child of node.children) {
    if (!isEmptyNode(child)) return false;
  }
  return true;
}

function filterTasks(search) {
  const filteredTasks = Object.values(xer.TASK).filter((t) =>
    t.search.toLowerCase().includes(search.toLowerCase())
  );

  for (const node of Object.values(xer.PROJWBS)) {
    node.tasks = [];
  }

  for (const task of filteredTasks) {
    xer.PROJWBS[task.wbs_id].tasks.push(task);
  }
  showSchedule();
}

async function handleDrop(files) {
  try {
    const data = await readFile(files[0]);
    xer = parseTables(data);
    showSchedule();
  } catch (err) {
    if (err instanceof XerError) {
      alert(err.message);
    } else {
      console.error(err);
    }
  }
}

function showSchedule() {
  sched.replaceChildren(); // clear any existing children
  sched.appendChild(schedLabels());
  for (let proj of Object.values(xer.PROJECT)) {
    createNode(proj.wbs, 0, sched);
  }
  dropArea.style.display = "none";
  searchInput.style.display = "initial";
}

function createNode(node, level, parent) {
  if (isEmptyNode(node)) {
    return;
  }

  const div = document.createElement("div");
  div.classList.add("node");
  div.classList.add(`l${level}`);
  div.id = node.wbs_id;
  const name = document.createElement("p");
  name.textContent = node.wbs_name;
  div.appendChild(name);

  name.classList.add("ctr");
  const childDiv = document.createElement("div");

  if (node.tasks.length > 0) {
    childDiv.appendChild(taskTable(node.tasks, level));
  }

  for (let child of node.children.sort((a, b) => a.seq_num - b.seq_num)) {
    createNode(child, level + 1, childDiv);
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
