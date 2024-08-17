/** A class to represent a Notebook Topic */
export class MemoType {
  constructor(obj) {
    Object.assign(this, obj);
  }
}

/** A class to represent a notebook memo for a WBS Node */
export class WbsMemo {
  constructor(obj) {
    Object.assign(this, obj);
    /** @type {MemoType} */
    this.memoType;
    this.wbsNode;
  }
}

/** A class to represent a notebook memo for a task */
export class TaskMemo {
  constructor(obj) {
    Object.assign(this, obj);
    /** @type {MemoType} */
    this.memoType;
    this.task;
  }
}
