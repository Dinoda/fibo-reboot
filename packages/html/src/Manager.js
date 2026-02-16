import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, resolve, join } from 'node:path';

import { parseFragment, parse, serialize, defaultTreeAdapter as TreeAdapter } from 'parse5';

import { HTMLFiboError } from './exceptions.js';

import Initializer from './Initializer.js';
import Builder from './Builder.js';
import Stringalizer from './Stringalizer.js';

const DEFAULT_OPTS = {
	initializer: Initializer,
	builder: Builder,
	stringalizer: Stringalizer,
};

export default class SSRManager {

	static componentRegex = /\.comp(.html)?$/;
	static layoutRegex = /\.layout(.html)?$/;

	constructor(options = {}) {
		options = {
			...DEFAULT_OPTS,
			...options,
		};

		this.stringalizer = new (options.stringalizer)(this);

		this.initializer = new (options.initializer)(this);

		this.builder = new (options.builder)(this, this.stringalizer);

		this.pages = {};
		this.renders = {};
		this.layouts = {};
		this.components = {};
		this.callbacks = options.callbacks ?? {};
	}

	// Loading //
	// ======= //

	async loadFromDirectory(root, path = '') {
		root = resolve(root);
		const files = await readdir(join(root, path));

		for (const file of files) {
			await this.loadFile(file, root, path);
		}
	}

	async loadFile(filename, root, path = '') {
		const filepath = join(root, path, filename);
		const name = join(path, basename(filename, '.html'));

		const filestat = await stat(filepath);

		if (filestat.isDirectory()) {
			this.loadFromDirectory(root, join(path, filename));
		} else {
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
			throw new HTMLFiboError(`Building process requested component named "${name}" but it wasn't found`, null, data);
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
			throw new HTMLFiboError(`No page named "${name}" found to build in the builder`, null, data);
		}

		this.renders[name] = this.builder.build(page, data);

		return this.renders[name];
	}

	// #text Nodes Specifics //
	// ===================== //

	/**
	 * ^ From start
	 * \s+ 1 or more spaces
	 * $ To end
	 */
	static emptyRegex = /^\s+$/;

	/**
	 * (^|[^\\]) From start or no "\" before
	 * (		main group
	 * 	{{	starting with 
	 * 	(
	 * 		[^}]+	One or more non-"}" characters
	 * 		(\\})?	With possibly a "}" preceded by a "\"
	 * 	)*		Any number of time
	 * 	}}	ending with
	 * )
	 */
	static dataRegex = /(^|[^\\])({{([^}]+(\\})?)*}})/g;

	/**
	 *
	 */
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
