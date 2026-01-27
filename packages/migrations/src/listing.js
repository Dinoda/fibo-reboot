import listFiles from './fs/listFiles.js';

const re = /\.reverse\.sql$/;

const isReverse = (name) => {
	return name.match(re);
};

const isNotReverse = (name) => {
	return ! isReverse(name);
}

export default async (reverse) => {
	return listFiles(reverse ? isReverse : isNotReverse);
}

