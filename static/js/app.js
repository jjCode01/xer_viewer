import { schedLabels } from "./components/taskDiv.js";
import readFile from "./reader.js";
import { parseTables } from "./parser.js";
import XerError from "./error.js";
import { updateTaskDialog } from "./components/taskDialog.js";
import nodeDiv from "./components/nodeDiv.js";

const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
const sched = document.getElementById("sched");
const searchInput = document.getElementById("search-input");
const taskDialog = document.getElementById("taskDialog");
const closeButton = document.getElementById("closeDialog");
const tabs = document.querySelectorAll(".tab");
const tabPanes = document.querySelectorAll(".tab-pane");
let xer = undefined;

closeButton.addEventListener("click", () => {
  taskDialog.close();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Deactivate all tabs and panes
    tabs.forEach((t) => t.classList.remove("active"));
    tabPanes.forEach((p) => p.classList.remove("active"));

    // Activate the clicked tab and its corresponding pane
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

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
  const searchTerm = searchInput.value.toLowerCase();
  filterTasks(searchTerm);
});

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
  let hasCost = false;
  for (const proj of Object.values(xer.PROJECT)) {
    if (proj.resources.length > 0) {
      hasCost = true;
      break;
    }
  }
  sched.appendChild(schedLabels(hasCost));
  for (let proj of Object.values(xer.PROJECT)) {
    nodeDiv(proj.wbs, 0, sched, hasCost);
  }
  dropArea.style.display = "none";
  searchInput.style.display = "initial";

  const tasks = document.querySelectorAll(".task");
  tasks.forEach((task) => {
    task.addEventListener("click", () => {
      tasks.forEach((t) => t.classList.remove("selected"));
      task.classList.add("selected");
    });
    task.addEventListener("dblclick", () => {
      tasks.forEach((t) => t.classList.remove("selected"));
      task.classList.add("selected");
      updateTaskDialog(xer.TASK[task.id]);
      taskDialog.showModal();
    });
  });
}
