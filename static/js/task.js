import { formatDate } from "./utils.js";

export function getTotalFloat(task) {
  const tfHrs = task.total_float_hr_cnt;
  return tfHrs == "" ? "" : parseInt(tfHrs / 8);
}

export function getTaskStart(task) {
  if (task.task_type == "TT_FinMile") return "";

  if (task.status_code == "TK_NotStart") {
    return formatDate(task.early_start_date);
  }
  return `${formatDate(task.act_start_date)} A`;
}

export function getTaskFinish(task) {
  if (task.task_type == "TT_Mile") return "";

  if (task.status_code == "TK_Complete") {
    return `${formatDate(task.act_end_date)} A`;
  }
  return formatDate(task.early_end_date);
}
