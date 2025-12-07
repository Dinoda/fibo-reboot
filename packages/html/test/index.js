import test from 'node:test';

import fs from 'node:fs';

import SSRManager from '../src/Manager.js';

const bld = new SSRManager();

await bld.loadFromDirectory('./test/html');

test('Basic page building test', (t) => {
	bld.buildPage('index', {quotes: [
		{
			name: "Test1",
			description: "Description1",
			note: "Whatever",
			hour: 13,
			minute: 26,
		},
		{
			name: "A moi à l'assassin",
			description: "Eveque Boniface",
			note: "Kaamelott",
			hour: 0,
			minute: 12,
		}
	]});

	const indexHTML = bld.getPageHTML('index');

	t.assert.strictEqual(indexHTML, fs.readFileSync('./test/result.html', 'utf-8').trim());
});

