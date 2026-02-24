import { Database } from 'fibo-database';

import getFileContent from './fs/getFileContent.js';

export default async (database, file) => {
	const content = await getFileContent(file);

	await database.query(content, []);
}
