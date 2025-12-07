import test from 'node:test';

import SSRManager from '../src/Manager.js';

const bld = new SSRManager();

await bld.loadFromDirectory('./test/html');

bld.buildPage('index');

console.log(bld.getPageHTML('index'));

