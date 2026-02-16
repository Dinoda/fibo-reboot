import { FiboError } from 'fibo-common';

export class HTMLFiboError extends FiboError {
	constructor(message, element, data) {
		super(message);

		this.elements = [];
		this.data = data;

		if (element) this.pushElement(element);
	}

	pushElement(element) {
		this.elements.push(element);
	}

	getHTMLFiboTrace() {
		return `
		${this.message}\n
		${elements}\n
		${JSON.stringify(data)}
		`;
	}
};

export class HTMLInitializationError extends HTMLFiboError {};

export class HTMLBuildingError extends HTMLFiboError {};
