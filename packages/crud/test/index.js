import test from 'node:test';

import database from './database.js';
import CRUD from '../src/crud.js';

import { z } from 'zod';

const selectValidator = z.array(z.object({
	filename: z.string(),
	name: z.string(),
	description: z.string(),
	work: z.string(),
	episode: z.string(),
}));

test('CRUD Validation test', (t) => {
	const crud = new CRUD(database, {
		select: {
			sql: 'SELECT * FROM...',
			params: [],
			validator: selectValidator,
		},
		update: {
			sql: 'UPDATE',
			type: 'UPDATE',
		},
	});
});
