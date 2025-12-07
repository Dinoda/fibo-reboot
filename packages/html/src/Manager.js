import { readdir, readFile } from 'node:fs/promises';
import { basename, resolve, join } from 'node:path';

import { parseFragment, parse, serialize, defaultTreeAdapter as TreeAdapter } from 'parse5';

import Initializer from './Initializer.js';
import Builder from './Builder.js';

const DEFAULT_OPTS = {
	initializer: Initializer,
	builder: Builder,
};

export default class SSRManager {

	static componentRegex = /\.comp(.html)?$/;
	static layoutRegex = /\.layout(.html)?$/;

	constructor(options = {}) {
		options = {
			...DEFAULT_OPTS,
			...options,
		};

		this.initializer = new (options.initializer)(this);
		this.builder = new (options.builder)(this);

		this.pages = {};
		this.renders = {};
		this.layouts = {};
		this.components = {};
	}

	// Loading //
	// ======= //

	async loadFromDirectory(path) {
		path = resolve(path);
		const files = await readdir(path);

		for (const file of files) {
			await this.loadFile(file, path);
		}
	}

	async loadFile(filename, path) {
		const filepath = join(path, filename);
		const name = basename(filename, '.html');

		const content = await readFile(filepath, 'utf-8');

		if (name.match(SSRManager.componentRegex)) {
			this.loadComponent(
				name.replace(SSRManager.componentRegex, ''), 
				content
			);
		} else if (name.match(SSRManager.layoutRegex)) {
			this.loadLayout(
				name.replace(SSRManager.layoutRegex, ''),
				content
			);
		} else {
			this.loadPage(
				name,
				content
			);
		}
	}

	loadPage(name, content) {
		this.pages[name] = this.initialize(content);
	}

	loadComponent(name, content) {
		this.components[name] = this.initialize(content);
	}

	loadLayout(name, content) {
		this.layouts[name] = this.initializeLayout(content);
	}

	getPageHTML(name) {
		return serialize(this.renders[name]);
	}

	// Initialization //
	// ============== //

	initialize(content) {
		const frg = parseFragment(content);

		this.initializer.initialize(frg);

		return frg;
	}

	initializeLayout(content) {
		const doc = parse(content);

		this.initializer.initialize(doc);

		return doc;
	}

	// Building //
	// ======== //

	build(name, data) {
		const res = this.components[name];

		if (! res) {
			throw new Error(`Building process requested component named "${name}" but it wasn't found`);
		}

		return this.builder.build(res, data);
	}
	
	buildLayout(name, data) {
		const lay = this.layouts[name];

		if (! lay) {
		}

		return this.builder.build(lay, data);
	}

	buildPage(name, data) {
		const page = this.pages[name];

		if (! page) {
			throw new Error(`No page named "${name}" found to build in the builder`);
		}

		this.renders[name] = this.builder.build(page, data);

		return this.renders[name];
	}

	// #text Nodes Specifics //
	// ===================== //

	static emptyRegex = /^\s+$/;
	static dataRegex = /(^|[^\\])({{([^}]+(\\})?)*}})/g;
	static cleanRegex = /(^\s+)|(\s+$)/g;


	getTrimmingRegex() {
		return SSRManager.cleanRegex;
	}

	getRemovingRegex() {
		return SSRManager.emptyRegex;
	}

	getInsertionsRegex() {
		return SSRManager.dataRegex;
	}
}
