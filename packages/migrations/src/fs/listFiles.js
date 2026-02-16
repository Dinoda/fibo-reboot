import fs from 'fs/promises';

import { MIGRATION_DIRECTORY } from '../consts.js';

const DEFAULT_CHECK = () => true;

export default async (checkFile) => {
	checkFile = checkFile ?? DEFAULT_CHECK;

	const files = await fs.readdir(MIGRATION_DIRECTORY);
	const list = [];

	for (const file of files) {
		if (checkFile(file)) {
			list.push(file);
		}
	}

	return list;
}
