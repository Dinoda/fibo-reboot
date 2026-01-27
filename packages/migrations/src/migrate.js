import { Database } from 'fibo-database';

import getFileContent from './fs/fileContent.js';

export default async (database, file) => {
	await database.query(getFileContent(file));
}
