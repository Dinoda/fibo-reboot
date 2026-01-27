import { readline } from 'readline';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const getPrompt = (question, options) => {
	return question + '\n' + 
		options.map((opt, index + 1) => {
			return index + '. ' + opt;
		}).join('\n') +
		"0. Exit\n";
};

const optionQuestion = (question, options) => {
	return new promise((resolve) => {
		rl.question(getPrompt(question, options), (answer) => {
			const id = parseInt(answer);

			resolve({ 
				index: id - 1, 
				option: id == 0 ? 'Exit' : options[id - 1],
			});
		});
	});
};

export default function (question, options) {
	if (options) {
		return optionQuestion(question, options);
	}
	
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer.trim());
		});
	});
};
