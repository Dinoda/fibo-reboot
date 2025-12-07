import { Database } from 'fibo-database';
import Validator, { types as v } from 'fibo-validate';
import CRUDValidationError from './exception/validationError.js';
import CRUDError from './exception/CRUDError.js';

const operationValid = new Validator({
  sql: v.requiredAnd(v.string),
  /**
   * params {string[]|object}
   * [Optional]
   *
   * ['id', 'name'] will give the data's "id" and "name" attribute in that order, the database will handle the element's typing.
   *
   * As an object, the keys are used as the array, and the value define the handling of the data's handling ('integer' and 'number', or a callback).
   *
   * Default to []
   */
  params: v.nullableOr(v.or(v.array, v.object)),
  /**
   * hydrator {string|callback}
   * [Optional]
   *
   * Hydrator or its name for this operation
   *
   * Default to option's "defaultHydrator" (TYPE_SELECT) or "defaultUpdateHydrator" (TYPE_UPDATE) (none for TYPE_DELETE)
   */
  hydrator: v.nullableOr(v.callable),
  /**
   * validator {string}
   * [Optional]
   *
   * Name of the validator for this operation
   *
   * Default to options's "defaultValidator"
   */
  validator: v.nullableOr(v.callable),
  /**
   * type {integer}
   * [Optional]
   *
   * Indicate the type of the operation, to ensure correct process.
   *
   * TYPE_SELECT move validation on the query's result, instead of the input data
   * TYPE_DELETE remove any validation
   *
   * Default to TYPE_SELECT
   */
  type: v.nullableOr(v.integer),
});

const optionValidator = new Validator({
  defaultHydrator: 'callable',
  defaultUpdateHydrator: 'callable',
  defaultValidator: 'callable',
});

const DEFAULT_OPTIONS = {
  defaultHydrator: (a) => a,
  defaultUpdateHydrator: (a) => a,
};

/**
 * => Request => Operation (Parameters, Object) => Hydration => Result => 
 *
 *
 */
export default class CRUD {

  static TYPE_SELECT = 0;
  static TYPE_UPDATE = 1;
  static TYPE_INSERT = 2;
  static TYPE_DELETE = 3;
  static TYPE_OTHER = 4;

  static PRE_VALIDATION = [
    CRUD.TYPE_UPDATE,
    CRUD.TYPE_INSERT,
  ];

  static POST_VALIDATION = [
    CRUD.TYPE_SELECT,
  ];

  constructor(database, operations, options = {}) {
    if (! (database instanceof Database)) {
      throw new CRUDError("database is expected to be an instance of Database");
    }

    if (! optionValidator.validate(options)) {
      throw new CRUDError(`Options are not valid`, optionValidator.detail(options));
    }

    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    for (const k in operations) {
      const ope = operations[k];
      if (! operationValid.validate(ope)) {
        throw new CRUDError(`Operation "${k}" is not a valid operation`, operationValid.detail(ope));
      }
    }

    this.db = database;
    this.operations = operations;
  }

  async callOperation(name, data) {
    const ope = this.operations[name];

    if (!ope) {
      throw new CRUDError(`Unknown operation "${name}", couldn't proceed`);
    }

    const validator = ope.validator;

    // Validator pre-query for update and insert
    if (CRUD.PRE_VALIDATION.includes(ope.type) && validator) {
      if (! validator.validate(data)) {
        throw new CRUDValidationError(`Unvalid data provided for operation "${name}", failure to process operation`, validator.detail(data));
      }
    }

    const fields = this.resolveFields(ope.params, data);
    const result = await this.db.query(ope.sql, fields);
    const hydrated = this.hydrate(ope.hydrator, result, ope.type);

    // Validator post-query for select only
    if (CRUD.POST_VALIDATION.includes(ope.type) && validator) {
      const h = v.object(hydrated) ? Object.values(hydrated) : hydrated;
      for (const row of h) {
        if (! validator.validate(row)) {
          throw new CRUDValidationError(`Hydrated data is not valid for operation "${name}", check your validator and hydrator or fix your database`, validator.detail(row));
        }
      }
    }

    return hydrated;
  }

  resolveFields(params, data) {
    if (!params) {
      return [];
    }

    if (v.array(params)) {
      return params.map((a) => {
        return data[a];
      });
    }

    return Object.keys(params).map((k) => {
      const type = params[k];

      if (v.callable(type)) {
        return type(data[k]);
      }

      switch(type) {
        case 'number':
          const f = parseFloat(data[k]);
          return Number.isNaN(f) ? null : f;
          break;
        case 'integer': 
          const i = parseInt(data[k]);
          return Number.isNaN(i) ? null : i;
          break;
        default:
          return data[k] ? data[k] : null;
      }
    });
  }

  hydrate(hydrator, data, type) {
    if (hydrator) {
      return hydrator(data);
    }

    return type === CRUD.TYPE_SELECT ? this.options.defaultHydrator(data) : this.options.defaultUpdateHydrator(data);
  }

  getValidator(ope) {
    if (ope.validator) {
      return this.validators[ope.validator];
    }

    return this.options.defaultValidator;
  }

  proxy() {
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target.operations) {
          return (data) => {
            return target.callOperation(prop, data);
          };
        } else if (typeof target.prop !== undefined) {
          return Reflect.get(target, prop);
        }
      }
    });
  }
}
