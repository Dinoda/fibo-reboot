import { defaultTreeAdapter as TreeAdapter } from 'parse5';

export default class Initializer {
	constructor(manager) {
		this.manager = manager;
	}

	initialize(source) {
		const stk = [source];

		while(stk.length > 0) {
			const curr = stk.pop();

			if (curr.childNodes) {
				for (const child of curr.childNodes) {
					stk.push(child);
				}
			}

			if (curr.nodeName === "#text") {
				this.initializeTextNode(curr);
			} else if (curr.attrs) {
				this.initializeStandardNode(curr);
			}
		}
	}

	initializeTextNode(source) {
		if (this.isNodeToRemove(source)) {
			TreeAdapter.detachNode(source);
		} else {
			this.trimTextNode(source);

			source.fb = {
				insertions: this.getInsertions(source),
			};
		}
	}

	initializeStandardNode(source) {
		source.fb = {};

		for (const {name, value} of source.attrs) {
			switch(name) {
				case 'multiple': 
					source.fb.multiple = true;
					break;
				case 'component':
					source.fb.component = value;
					break;
				case 'layout': 
					source.fb.layout = value;
					break;
				default:
					break;
			}
		}
	}

	trimTextNode(node) {
		node.value = node.value.replaceAll(this.manager.getTrimmingRegex(), '');
	}

	isNodeToRemove(node) {
		return this.manager.getRemovingRegex().test(node.value);
	}

	getInsertions(node) {
		const inserts = [];

		const matches = node.value.matchAll(this.manager.getInsertionsRegex());

		for (const match of matches) {
			const res = {
				name: match[3],
				startAt: match.index + (match[1] === '' ? 0 : 1),
			};

			res.endAt = res.startAt + match[2].length;

			inserts.push(res);
		}

		return inserts;
	}
}
