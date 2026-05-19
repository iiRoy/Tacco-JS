function DataParser(sourceText) {
	// Reference to the current instance of the parser
	const instance = this;

	// Initialize the index for the current token
	instance.currentIndex = 0;

	// Store the original input string
	instance.originalContent = sourceText;

	// Process the input string to tokenize it
	instance.tokenizedParts = (function(inputString) {
		// Array to hold the resulting tokens
		let parsedTokens = [];

		// Replace multiple newlines, spaces, and tabs with a single space
		const cleanedString = inputString.replace(/[\n \t]+/g, " ");

		// Split the cleaned string by spaces to get individual tokens
		const splitSegments = cleanedString.split(" ");

		// Iterate through the split segments and add them to the result array
		for (let idx = 0, lengthVal = splitSegments.length; idx < lengthVal; idx++) {
			parsedTokens.push(splitSegments[idx]);
		}
		return parsedTokens;
	}(sourceText)); // Immediately invoke with the source text

	// Method to retrieve the next token as a string
	instance.getNextToken = function() {
		const currentValue = instance.tokenizedParts[instance.currentIndex];
		instance.currentIndex++; // Advance the token index
		// Return the token if it exists, otherwise null
		return (currentValue !== undefined) ? currentValue : null;
	};

	// Method to retrieve the next token as an integer
	instance.getNextInteger = function() {
		const currentValue = instance.tokenizedParts[instance.currentIndex];
		instance.currentIndex++; // Advance the token index
		// Parse and return the integer, or null if no token
		return (currentValue !== undefined) ? parseInt(currentValue, 10) : null;
	};

	// Method to retrieve the next token as a floating-point number (BigDecimal equivalent)
	instance.getNextFloat = function() {
		const currentValue = instance.tokenizedParts[instance.currentIndex];
		instance.currentIndex++; // Advance the token index
		// Parse and return the float, or null if no token
		return (currentValue !== undefined) ? parseFloat(currentValue) : null;
	};

	// Method to retrieve the next token as a byte array (conceptual, as JS doesn't have direct bytes)
	instance.getNextByteArray = function() {
		const currentValue = instance.tokenizedParts[instance.currentIndex];
		instance.currentIndex++; // Advance the token index
		// Return a new Int8Array from the token, or null
		return (currentValue !== undefined) ? new Int8Array(currentValue) : null;
	};
}

// Main function to process the input data
function ProcessInput(dataReader) {

	// Read the number of elements (N) and the target iteration count (K)
	const numElements = dataReader.getNextInteger();
	let targetIteration = dataReader.getNextInteger();

	// Initialize a mapping table (object acting as a hash map)
	const mappingTable = {};

	// Populate the mapping table based on N elements
	for (let loopCounter = 0; loopCounter < numElements; loopCounter++) {
		mappingTable[loopCounter + 1] = dataReader.getNextInteger();
	}

	// Initialize the current position, starting from 1
	let currentPosition = 1;
	// Keep track of visited positions and the iteration they were first seen
	const visitedPositions = {};

	// Simulate the process to detect cycles
	let loopCounter;
	for (loopCounter = 0; loopCounter < numElements; loopCounter++) {
		currentPosition = mappingTable[currentPosition]; // Move to the next position
		// If the current position has been visited before, a cycle is detected
		if (visitedPositions[currentPosition] !== undefined) {
			break; // Exit the loop
		}
		visitedPositions[currentPosition] = loopCounter; // Record the first visit iteration
	}

	// If a cycle was detected before completing N iterations
	if (loopCounter < numElements) {
		// Calculate the length of the detected cycle
		const cycleLength = loopCounter - visitedPositions[currentPosition];
		// Calculate the number of steps before entering the cycle
		const preCycleLength = visitedPositions[currentPosition];

		// Adjust K to account for the cycle
		// First, subtract the steps before the cycle
		// Then, take the modulo of the cycle length to find the equivalent position within the cycle
		// Finally, add back the steps before the cycle to get the effective K
		targetIteration = ((targetIteration - preCycleLength) % cycleLength) + preCycleLength;
	}

	// Reset the current position to 1 for the final calculation
	currentPosition = 1;
	// Perform the final K iterations
	for (let loopCounter = 0; loopCounter < targetIteration; loopCounter++) {
		currentPosition = mappingTable[currentPosition]; // Move to the next position
	}

	// Output the final position
	console.log(currentPosition);
}

// Execute the main processing function with a new DataParser instance
// The DataParser reads input from standard input using Node.js 'fs' module
ProcessInput(new DataParser(require("fs").readFileSync("/dev/stdin", "utf8")));

// Example usage for testing (commented out in production)
// ProcessInput(new DataParser("10 1 2 5 3 4 6 7 3 2 4 1 2 2 3 3 4 4 5 3 6 6 7 1 8 8 9 9 10"));

// Other potential data reading methods (commented out)
// const stringValue = dataReader.getNextToken(); // Get as String
// const integerValue = dataReader.getNextInteger(); // Get as int
// const floatValue = dataReader.getNextFloat(); // Get as BigDecimal
// const byteArrayValue = dataReader.getNextByteArray(); // Get as byte array
// A dummy loop for artificial delay (commented out)
// for (let delayCounter = 0; delayCounter < 1000000000; delayCounter++) { const dummyVar = "dummy"; }
// console.log(outputNumbers); return;
