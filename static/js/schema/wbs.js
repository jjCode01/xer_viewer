export default class WbsNode {
  constructor(obj) {
    Object.assign(this, obj);
    this.parent = undefined;
    this.children = [];
    this.tasks = [];
  }

  get actualCost() {
    return calcCost(this, "actualCost");
  }

  get budgetCost() {
    return calcCost(this, "budgetCost");
  }

  get code() {
    if (!this.parent) return this.wbs_short_name;
    return `${this.parent.code}.${this.wbs_short_name}`;
  }

  get isProjectNode() {
    return this.proj_node_flag === "Y";
  }

  get length() {
    return this.children.reduce(
      (acc, child) => acc + child.length,
      this.tasks.length
    );
  }

  get remainingCost() {
    return calcCost(this, "remainingCost");
  }

  get thisPeriodCost() {
    return calcCost(this, "thisPeriodCost");
  }
}

function calcCost(node, attr) {
  const taskCost = node.tasks.reduce((acc, task) => acc + task[attr], 0.0);
  return node.children.reduce((acc, child) => acc + child[attr], taskCost);
}
