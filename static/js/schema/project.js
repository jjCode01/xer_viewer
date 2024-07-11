export default class Project {
  constructor(obj) {
    Object.assign(this, obj);
    this.wbs = undefined;
    this.tasks = [];
    this.relationships = [];
  }

  get actualCost() {
    return this.tasks.reduce(
      (acc, task) => acc + task.act_reg_cost + task.act_ot_cost,
      0.0
    );
  }

  get budgetCost() {
    return this.tasks.reduce((acc, task) => acc + task.budgetCost, 0.0);
  }

  get remainingCost() {
    return this.tasks.reduce((acc, task) => acc + task.remainingCost, 0.0);
  }

  get thisPeriodCost() {
    return this.tasks.reduce((acc, task) => acc + task.thisPeriodCost, 0.0);
  }
}
