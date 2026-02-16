import fs from 'fs/promises';

import ask from './interface.js';
import listing from './listing.js';
import createMigrationFiles from './fs/createMigrationFiles.js';

export default async () => {
	const { index, option } = await ask('What do you want to do ?', [
		'Create a migration',
		'Migrate', 
		'Reverse',
	]);

	if (index == -1) {
		process.exit(0);
	}

	switch(option) {
		case 'Reverse':
		case 'Migrate':
			const reverse = option == 'Reverse';

			return listing(reverse);
			break;
		case 'Create a migration':
			const response = await ask('What do you want to name the file ?');

			await createMigrationFiles(response);
			break;
		default:
			console.error('Unknown option');
			process.exit(-1);
	}
};
