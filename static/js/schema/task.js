const STATUSTYPES = {
  TK_NotStart: "Not Started",
  TK_Active: "In Progress",
  TK_Complete: "Completed",
};

const PERCENTTYPES = {
  CP_Phys: "Physical",
  CP_Drtn: "Duration",
  CP_Units: "Unit",
};

const TASKTYPES = {
  TT_Mile: "Start Milestone",
  TT_FinMile: "Finish Milestone",
  TT_LOE: "Level of Effort",
  TT_Task: "Task Dependent",
  TT_Rsrc: "Resource Dependent",
  TT_WBS: "WBS Summary",
};

const CONSTRAINTTYPES = {
  CS_ALAP: "As Late as Possible",
  CS_MEO: "Finish On",
  CS_MEOA: "Finish on or After",
  CS_MEOB: "Finish on or Before",
  CS_MANDFIN: "Mandatory Finish",
  CS_MANDSTART: "Mandatory Start",
  CS_MSO: "Start On",
  CS_MSOA: "Start On or After",
  CS_MSOB: "Start On or Before",
};

export default class Task {
  constructor(obj) {
    Object.assign(this, obj);
    this.notStarted = this.status_code === "TK_NotStart";
    this.inProgress = this.status_code === "TK_Active";
    this.completed = this.status_code === "TK_Complete";
    this.longestPath = this.driving_path_flag === "Y";
    this.isMilestone = this.task_type.endsWith("Mile");
    this.isLOE = this.task_type === "TT_LOE";
    this.status = STATUSTYPES[this.status_code];
    this.origDur = parseInt(this.target_drtn_hr_cnt / 8);
    this.remDur = parseInt(this.remain_drtn_hr_cnt / 8);
    this.totalFloat = this.completed
      ? NaN
      : parseInt(this.total_float_hr_cnt / 8);
    this.freeFloat = this.completed
      ? NaN
      : parseInt(this.free_float_hr_cnt / 8);
    this.resources = [];
    this.predecessors = [];
    this.successors = [];
    // this.wbsMap = [];
    this.memos = {};
    this.start = this.notStarted ? this.early_start_date : this.act_start_date;
    this.finish = this.completed ? this.act_end_date : this.early_end_date;
    this.percentType = PERCENTTYPES[this.complete_pct_type];
    this.thisType = TASKTYPES[this.task_type];
    this.primeConstraint = CONSTRAINTTYPES[this.cstr_type];
    this.secondConstraint = CONSTRAINTTYPES[this.cstr_type2];
    this.percent = calcPercent(this);
    this.search = `${this.task_code} ${this.task_name}`;
    this.calendar = undefined;
    this.wbs = undefined;
  }
  get budgetCost() {
    return this.resources.reduce((a, r) => a + r.target_cost, 0.0);
  }
  get actualCost() {
    return this.resources.reduce(
      (a, r) => a + r.act_reg_cost + r.act_ot_cost,
      0.0
    );
  }
  get thisPeriodCost() {
    return this.resources.reduce((a, r) => a + r.act_this_per_cost, 0.0);
  }
  get remainingCost() {
    return this.resources.reduce((a, r) => a + r.remain_cost, 0.0);
  }
  get budgetQty() {
    return this.resources.reduce((a, r) => a + r.target_qty, 0.0);
  }
  get actualQty() {
    return this.resources.reduce(
      (a, r) => a + r.act_reg_qty + r.act_ot_qty,
      0.0
    );
  }
  get thisPeriodQty() {
    return this.resources.reduce((a, r) => a + r.act_this_per_qty, 0.0);
  }
  get remainingQty() {
    return this.resources.reduce((a, r) => a + r.remain_qty, 0.0);
  }
}

Task.prototype.equals = function (other) {
  return this.task_code === other.task_code;
};

const calcPercent = (task) => {
  if (task.notStarted) return 0.0;
  const pt = {
    CP_Phys: task.phys_complete_pct / 100,
    CP_Drtn: task.remDur >= task.origDur ? 0 : 1 - task.remDur / task.origDur,
    CP_Units:
      1 -
      (task.act_work_qty + task.act_equip_qty) /
        (task.target_work_qty = task.target_equip_qty),
  };
  return pt[task.complete_pct_type];
};
