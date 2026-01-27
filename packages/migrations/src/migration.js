import ask from './interface.js';
import migrate from './migrate.js';

export default async (database, files) => {
	let loop = true;

	while (loop) {
		const {index, option} = ask('What migration do you want to execute ?',
			[...files, 'All']);

		if (index == -1) {
			loop = false;
		} else if (option == "All") {
			for (const file of files) {
				await migrate(database, file);
			}

			loop = false;
		} else {
			await migrate(database, option);
		}
	}
};
