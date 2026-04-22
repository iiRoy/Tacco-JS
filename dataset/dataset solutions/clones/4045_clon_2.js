const inputUtil = require("readline");

let dataSegments = [];

const lineHandler = inputUtil.createInterface({
	input: process.stdin, // Standard input stream
	output: process.stdout // Standard output destination
});

const computationRoutine = (function* () {
	// Function to get a single line of text
	const acquireInput = () => lineHandler.once("line", receivedString => computationRoutine.next(receivedString));

	// Obtain and store the initial data fragment
	let inputPiece = yield acquireInput();
	dataSegments.push(inputPiece);

	// Obtain and store the subsequent data fragment
	inputPiece = yield acquireInput();
	dataSegments.push(inputPiece);

	// Obtain and store the final data fragment
	inputPiece = yield acquireInput();
	dataSegments.push(inputPiece);

	// Perform the first mathematical calculation on the data
	dataSegments[0] -= dataSegments[1];

	// Perform the second mathematical calculation on the data
	dataSegments[0] %= dataSegments[2];

	// Output the computed outcome to the console
	console.log(dataSegments[0]);

	// Terminate the running program
	process.exit();
})();

// Begin the sequence of operations
computationRoutine.next();