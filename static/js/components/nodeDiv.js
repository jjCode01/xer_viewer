import { taskTable } from "./taskDiv.js";

export default function nodeDiv(node, level, parent, hasCost) {
  if (node.length === 0) {
    // node and any children nodes do not have any tasks
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
    childDiv.appendChild(taskTable(node.tasks, level, hasCost));
  }

  for (let child of node.children.sort((a, b) => a.seq_num - b.seq_num)) {
    nodeDiv(child, level + 1, childDiv, hasCost);
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
