import { Database } from 'fibo-database';

import getFileContent from './fs/getFileContent.js';

export default async (database, file) => {
	await database.query(getFileContent(file));
}
