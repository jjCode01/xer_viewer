export function getProjects(data) {
  let validProjs = data.PROJECT.filter((p) => p.export_flag == "Y");
  for (let proj of validProjs) {
    proj.wbs = processWBS(data.PROJWBS, proj.proj_id);
    proj.tasks = processTask(data.TASK, proj.proj_id);
  }
  return validProjs;
}

function processWBS(wbsData, proj_id) {
  let projWbs = wbsData.filter((n) => n.proj_id == proj_id);
  let projNode = getProjNode(projWbs, proj_id);
  let wbs = processNode(projNode, projWbs);

  return wbs;
}

function processNode(node, wbsData) {
  node.children = [];
  node.tasks = [];
  for (let wbs of wbsData) {
    if (wbs.parent_wbs_id == node.wbs_id) {
      node.children.push(wbs);
      processNode(wbs, wbsData);
    }
  }
  return node;
}

function getProjNode(wbsData, proj_id) {
  for (let node of wbsData) {
    if (node.proj_node_flag == "Y" && node.proj_id == proj_id) {
      return node;
    }
    return null;
  }
}

function processTask(taskData, proj_id) {
  let tasks = {};
  for (let task of taskData.filter((t) => t.proj_id == proj_id)) {
    if (!(task.wbs_id in tasks)) {
      tasks[task.wbs_id] = [];
    }
    tasks[task.wbs_id].push(task);
  }
  return tasks;
}
