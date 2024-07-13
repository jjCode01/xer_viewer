export class ActvType {
  constructor(obj) {
    Object.assign(this, obj);
    this.codes = [];
  }
}

export class ActvCode {
  constructor(obj) {
    Object.assign(this, obj);
    this.actvType = undefined;
  }
}
