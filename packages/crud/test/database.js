import { Database, Transaction } from 'fibo-database';

import data from './data.js';

const transactionClass = class extends Transaction {
	constructor(database) {
	}

	__commit() {
	}

	__failure() {
	}

	__query() {
	}
}

const db = new class extends Database{
	constructor() {
		super(transactionClass);
	}

	__query(res, rej, sql, params) {
		if (sql.match(/^SELECT \*/)) {
			res(data);
			return;
		}

		res();
	}

	getOriginal() {
		return null;
	}
}

export default db;
