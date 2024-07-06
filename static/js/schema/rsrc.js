export class Rsrc {
  constructor(obj) {
    Object.assign(this, obj);
  }
}

export class TaskRsrc {
  constructor(obj) {
    Object.assign(this, obj);
  }
  get actualCost() {
    return this.act_reg_cost + this.act_ot_cost;
  }
  get actualQty() {
    return this.act_reg_qty + this.act_ot_aty;
  }
  get atCompletionCost() {
    return this.actualCost + this.remain_cost;
  }
  get atCompletionQty() {
    return this.actualQty + this.remain_qty;
  }
  get earnedValue() {
    return this.task.percent * this.target_cost;
  }
}
