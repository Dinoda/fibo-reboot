export default class CRUDError extends Error {
  constructor(message, details = null, ...params) {
    super(message, ...params);

    this.details = details;
  }
}

