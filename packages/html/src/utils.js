export function findChildrenWithAttribute(element, attribute) {
	if (hasAttribute(element, attribute)) {
		return element;
	}

	if (element.childNodes) {
		for (const child of element.childNodes) {
			const found = findChildrenWithAttribute(child, attribute);

			if (found) {
				return found;
			}
		}
	}

	return null;
}

export function getAttribute(element, attribute) {
	if (element.attrs) {
		for (const {name, value} of element.attrs) {
			if (name == attribute) {
				return value;
			}
		}
	}

	return null;
}

export function hasAttribute(element, attribute) {
	if (element.attrs) {
		for (const {name} of element.attrs) {
			if (name == attribute) {
				return true;
			}
		}
	}

	return false;
}
