export class TaskPred {
  constructor(obj) {
    Object.assign(this, obj);
    this.lag = parseInt(this.lag_hr_cnt / 8);
    this.link = this.pred_type.slice(-2);
    this.predecessor = undefined;
    this.successor = undefined;
  }
}
