const escapingRegex = new RegExp('[&"\'<>]', 'g');

const escapingDict = {
	'&': '&amp;',
	'"': '&quot;',
	'\'': '&apos;',
	'<': '&lt;',
	'>': '&gt;',
};

export default class Stringalizer {
	constructor(manager) {
		this.manager = manager;
	}

	buildElementString(element, data) {
		const inserts = element.fb.insertions;

		const length = inserts.length;

		let i = 0;
		let end = 0;

		let str = '';

		while (i < length) {
			const ins = inserts[i++];

			const datum = this.getData(ins, data);

			str += element.value.slice(end, ins.startAt) + this.displayableData(ins, datum);
			end = ins.endAt;
		}

		element.value = str + element.value.slice(end);
	}

	getData(insertion, data) {
		if (insertion.name == '.') {
			return data;
		} else { 
			return data[insertion.name];
		}
	}

	displayableData(insertion, datum) {
		for (const operation of insertion.operations) {
			datum = this.executeOperation(operation, datum);
		}

		return datum;
	}

	executeOperation(operation, data) {
		switch(operation) {
			case 'escape': 
			case 'esc':
				return data.replaceAll(escapingRegex, a => escapingDict[a]);
				break;
		}
	}
}
