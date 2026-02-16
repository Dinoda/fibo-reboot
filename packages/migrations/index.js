import init from './src/init.js';
import migration from './src/migration.js';

export default async (database) => {
	const list = await init();

	if (list) {
		await migration(database, list);
	}

	console.log('Migration finished');
};

