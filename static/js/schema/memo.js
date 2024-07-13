export class MemoType {
  constructor(obj) {
    Object.assign(this, obj);
    this.codes = [];
  }
}

export class WbsMemo {
  constructor(obj) {
    Object.assign(this, obj);
    this.memoType = undefined;
  }
}

export class TaskMemo {
  constructor(obj) {
    Object.assign(this, obj);
    this.memoType = undefined;
    this.task = undefined;
  }
}
