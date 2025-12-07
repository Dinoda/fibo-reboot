import { defaultTreeAdapter as TreeAdapter } from 'parse5';

import { findChildrenWithAttribute, getAttribute } from './utils.js';

export default class Builder {
	static DEFAULT_ATTRIBUTES_TO_CLEAN = [
		'multiple',
		'data',
		'component',
		'layout'
	];

	constructor(manager) {
		this.manager = manager;
		this.attributesToClean = Builder.DEFAULT_ATTRIBUTES_TO_CLEAN;
	}

	build(element, data) {
		let built;

		const layout = this.getLayout(element);

		if (layout) {
			built = this.manager.buildLayout(layout);

			const layoutInsertion = findChildrenWithAttribute(built, 'children');
			this.appendTo(layoutInsertion, this.buildElement(element, data));

			this.clean(built, ['children']);
		} else {
			built = this.buildElement(element, data);
		}

		this.clean(built);

		return built;
	}

	buildElement(element, data) {
		element = structuredClone(element);

		this.initializeElement(element, data);

		return element;
	}

	initializeElement(element, data) {
		data = this.selectData(element, data);

		if (element.fb?.multiple) {
			this.initializeMultiple(element, data);
		} else if (element.childNodes?.length > 0) {
			const children = Array.from(element.childNodes);
			for (const child of children) {
				if (child.fb?.component) {
					this.initializeComponent(child, child.fb.component, data);
				} else {
					this.initializeElement(child, data);
				}
			}
		} else if (element.fb?.insertions && element.fb.insertions.length > 0) {
			this.initializeString(element, data);
		}


		return element;
	}

	initializeMultiple(source, data) {
		delete source.fb.multiple;
		delete source.fb.data;

		const parentNode = source.parentNode;

		if (data) {
			if(! Array.isArray(data)) 
				data = Object.values(data);

			for (const datum of data) {
				const element = this.buildElement(source, datum);

				TreeAdapter.insertBefore(parentNode, element, source);
			}
		}

		TreeAdapter.detachNode(source);
	}

	initializeString(element, data) {
		const inserts = element.fb.insertions;

		const length = inserts.length;
		let i = 0;
		let end = 0;

		let str = '';

		while (i < length) {
			const ins = inserts[i++];

			str += element.value.slice(end, ins.startAt) + data[ins.name];
			end = ins.endAt;
		}

		element.value = str + element.value.slice(end);
	}

	initializeComponent(replaced, component, data) {
		const parent = replaced.parentNode;
		component = this.manager.build(component, data);

		if (component.nodeName == "#document-fragment") {
			for (const element of component.childNodes) {
				TreeAdapter.insertBefore(parent, element, replaced);
			}
		} else {
			TreeAdapter.insertBefore(parent, component, replaced);
		}

		TreeAdapter.detachNode(replaced);
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

	selectData(element, data) {
		if (element.fb?.data) {
			return data[element.fb.data];
		}

		return data;
	}

	clean(element, attributesToClean) {
		attributesToClean = attributesToClean ?? this.attributesToClean;

		if (element.attrs) {
			for (let i = element.attrs.length - 1;i > -1;i--) {
				if (attributesToClean.includes(element.attrs[i].name)) {
					element.attrs.splice(i, 1);
				}
			}
		}

		if (element.childNodes?.length > 0) {
			for (const child of element.childNodes) {
				this.clean(child, attributesToClean);
			}
		}
	}
}
