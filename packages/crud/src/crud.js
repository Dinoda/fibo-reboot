import * as CRUDErrors from './error/CRUDError.js';
import { types, operationArraySchema, optionsSchema, DEFAULT_OPTIONS } from './validation.js';

export default class CRUD {
	constructor(database, operations, options = {}) {
		operationArraySchema.parse(Object.values(operations));

		this.database = database;
		this.operations = operations;
		this.options = {
			...DEFAULT_OPTIONS,
			...optionsSchema.parse(options),
		};

		for (const name in this.operations) {
			const ope = this.operations[name];

			ope.type = ope.type ?? "SELECT";
			ope.hydrator = ope.hydrator ?? 
				(
					ope.type === "SELECT" 
					? this.options.defaultHydrator
					: this.options.defaultUpdateHydrator
				);
		}
	}

	async callOperation(name, data) {
		const ope = this.operations[name];

		if (!ope) {
			throw new CRUDErrors.CRUDOperationError(`Call to unknown operation "${name}", failure to execute a call`);
		}

		const validator = ope.validator ?? this.options.defaultValidator;

		if (validator && (ope.type === "UPDATE" || ope.type === "INSERT")) {
			if (! validator.parse(data)) {
				throw new CRUDErrors.CRUDOperationValidationError(`Data sent for operation "${name}" (${ope.type}) doesn't pass the given validator`);
			}
		}

		const fields = this.resolveFields(ope.params, data);
		const result = await this.db.query(ope.sql, fields);
		const hydrated = ope.hydrator(result, data, ope);

		if (validator && (ope.type === "SELECT")) {
			if (! validator.parse(result)) {
				throw new CRUDErrors.CRUDOperationValidationError(`Data obtained from query and hydration by operation "${name}" (SELECT) doesn't pass the given validator`);
			}
		}

		return hydrated;
	}

	resolveFields(params, data) {
		if (!params) {
			return [];
		}

		if (Array.isArray(params)) {
			return params.map((a) => {
				return data[a];
			});
		}

		return Object.keys(params).map((k) => {
			const type = params[k];

			if (z.function().safeParse(type).success) {
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

	hydrate(hydrator, data, result, operation) {
		if (hydrator) {
			return hydrator(result, data, operation);
		}

		return operation.type === "SELECT" ? this.options.defaultHydrator(result, data, operation) : this.options.defaultUpdateHydrator(result, data, operation);
	}

	proxy() {
		return new Proxy(this, {
			get(target, prop, receiver) {
				if (prop in target.operations) {
					return (data) => {
						return target.callOperation(prop, data);
					};
				} else if (typeof target.prop != undefined) {
					return Reflect.get(target, prop);
				}
			}
		});
	}
}
