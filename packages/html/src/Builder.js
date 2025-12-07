import { defaultTreeAdapter as TreeAdapter } from 'parse5';

import { findChildrenWithAttribute, getAttribute } from './utils.js';

export default class Builder {
	constructor(manager) {
		this.manager = manager;
	}

	build(element, data) {
		let built;

		const layout = this.getLayout(element);
		if (layout) {
			built = this.manager.buildLayout(layout);

			const layoutInsertion = findChildrenWithAttribute(built, 'children');
			this.appendTo(layoutInsertion, this.buildElement(element));
		} else {
			built = this.buildElement(element);
		}

		return built;
	}

	buildElement(element, data) {
		element = structuredClone(element);

		this.initializeElement(element);

		return element;
	}

	initializeElement(element, data) {
		if (element.childNodes?.length > 0) {
			for (const child of element.childNodes) {
				if (child.fb?.component) {
					const component = this.manager.build(child.fb.component);

					TreeAdapter.insertBefore(element, component.nodeName == "#document-fragment" ? component.childNodes[0] : component, child);
					TreeAdapter.detachNode(child);

					this.initializeElement(component);
				} else {
					if (child.fb?.insertions) {
						console.log(child.fb);
					}
					this.initializeElement(child);
				}
			}
		}

		return element;
	}

	getLayout(element) {
		if (element.nodeName === "#document-fragment") {
			element = element.childNodes[0];
		}

		return element.fb?.layout;
	}

	appendTo(target, source) {
		if (source.nodeName == "#document-fragment") {
			for (const child of source.childNodes) {
				TreeAdapter.appendChild(target, child);
			}
		} else {
			TreeAdapter.appendChild(target, source);
		}
	}
}
