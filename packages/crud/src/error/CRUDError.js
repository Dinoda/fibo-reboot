export class CRUDError extends Error {}

export class CRUDOperationError extends CRUDError {}

export class CRUDOperationValidationError extends CRUDOperationError {}
