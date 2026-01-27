import fs from 'node:fs/promises';
import { join } from 'node:path';

import { MIGRATION_DIRECTORY } from '../consts.js';

const createFile = async (filename) => {
	await fs.writeFile(
		join(
			MIGRATION_DIRECTORY, 
			filename
		),
		''
	);
};

export default async (filename) => {
	try {
		await fs.access(MIGRATION_DIRECTORY, fs.constants.F_OK);
	} catch (e) {
		await fs.mkdir(MIGRATION_DIRECTORY);
	}

	await Promise.all([
		createFile(filename + '.sql'),
		createFile(filename + '.reverse.sql'),
	]);
};
