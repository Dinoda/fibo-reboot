import readline from 'readline';

const getInterface = () => { 
	return readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false,
	});
};

const getPrompt = (question, options) => {
	return question + '\n' + 
		options.map((opt, index) => {
			return (index+1) + '. ' + opt;
		}).join('\n') +
		"\n0. Exit\n";
};

const optionQuestion = (question, options) => {
	return new Promise((resolve) => {
		const rl = getInterface();

		rl.question(getPrompt(question, options), (answer) => {
			const id = parseInt(answer) - 1;

			resolve({ 
				index: id, 
				option: id == -1 ? 'Exit' : options[id],
			});
		});
	});
};

export default function (question, options) {
	if (options) {
		return optionQuestion(question, options);
	}
	

	return new Promise((resolve) => {
		const rl = getInterface();

		rl.question(question, (answer) => {
			resolve(answer.trim());
		});
	});
};
