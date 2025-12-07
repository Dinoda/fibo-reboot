import CRUDError from './CRUDError.js';

export default class CRUDValidationError extends CRUDError {
  constructor(...params) {
    super(...params);
  }
}
