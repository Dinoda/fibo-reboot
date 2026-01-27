import fs from 'fs/promises';

import { MIGRATION_DIRECTORY } from '../consts.js';

export default async (checkFile) => {
	checkFile = checkfile ?? (a) => true;

	const files = await fs.readdir(MIGRATION_DIRECTORY);
	const list = [];

	for (const file of files) {
		if (checkFile(file)) {
			list.append(file);
		}
	}

	return list;
}
