import fs from 'node:fs/promises';
import { join } from 'node:path';

import { MIGRATION_DIRECTORY } from '../consts.js';

export default async (filename) => {
	return await fs.readFile(join(MIGRATION_DIRECTORY, filename), 'utf-8');
};
