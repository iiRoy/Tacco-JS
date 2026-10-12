function getInputLines() {
	// This function reads input from standard input.
	let rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
	return rawInputData.split(/\n\r?/); // Split by newline, handling both LF and CRLF
}

function createNumericSequence(startVal, endVal) {
	let resultArray = []; // Initialize an empty array to store numbers.
	for (let idxCounter = startVal; idxCounter <= endVal; idxCounter++) {
		resultArray.push(idxCounter); // Add each number in the range to the array.
	}
	return resultArray; // Return the generated sequence.
}

// Initialize a comprehensive map of card suits and their ranks.
let cardDeckMap = {
	S: createNumericSequence(1, 13), // Spades: ranks 1 through 13
	H: createNumericSequence(1, 13), // Hearts: ranks 1 through 13
	C: createNumericSequence(1, 13), // Clubs: ranks 1 through 13
	D: createNumericSequence(1, 13) // Diamonds: ranks 1 through 13
};

// Process each line of input, skipping the first line (often a count).
getInputLines().slice(1).forEach(function(currentLine) {
	let parsedParts = currentLine.split(' '); // Split the line into components.
	let suitIdentifier = parsedParts[0]; // The first part is the suit.
	let cardRank = +parsedParts[1]; // The second part is the rank (converted to number).

	// The following line would remove a card from the deck based on input.
	// cardDeckMap[suitIdentifier].splice(cardDeckMap[suitIdentifier].indexOf(cardRank), 1);
});

// Iterate through the remaining cards in the deck map.
for (let suitKey in cardDeckMap) {
	// The following lines would print the remaining cards, formatted.
	// console.log(cardDeckMap[suitKey].map(function(numValue) { return suitKey + ' ' + numValue; }).join("\n"));
}
