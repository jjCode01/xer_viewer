class CustomError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = this.constructor.name; // Set the error name
    this.details = details; // Additional error details
    Error.captureStackTrace(this, this.constructor); // Maintain stack trace
  }
}

export default class XerError extends Error {}
