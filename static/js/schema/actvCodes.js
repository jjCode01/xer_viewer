/** A class to represent an Activity Code Type */
export class ActvType {
  constructor(obj) {
    Object.assign(this, obj);
    /** @type {ActvCode[]} */
    this.codes = [];
  }

  /**
   * Add an activity code value
   * @param {ActvCode} code
   * @returns {void}
   */
  addCode(code) {
    if (!(code instanceof ActvCode)) {
      throw TypeError("`code` argument must be type `ActvCode`");
    }
    this.codes.push(code);
  }
}

/** A class to represent an Activity Code Value */
export class ActvCode {
  constructor(obj) {
    Object.assign(this, obj);
    /** @type {ActvType} */
    this.actvType;
  }
}
