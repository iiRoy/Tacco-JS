var totalCount;
var textFragments = [];
var bracketPairs = [];

// This function determines the balance of parentheses in a given string.
// It returns an array [unmatched_open, unmatched_close].
function analyzeBalance(inputString) {
	var balanceCounters = [0, 0]; // [open_needed, close_available]
	// Iterate through each character of the provided string.
	iterateRange(inputString.length, function(charIndex) {
		if (inputString.charAt(charIndex) === '(') {
			// If an opening parenthesis is found, increment the 'close_available' counter.
			++balanceCounters[1];
		} else { // Must be ')'
			if (balanceCounters[1] > 0) {
				// If there are available opening parentheses, decrement 'close_available'.
				--balanceCounters[1];
			} else {
				// Otherwise, this closing parenthesis is unmatched, increment 'open_needed'.
				++balanceCounters[0];
			}
		}
	});
	// Return the final balance state.
	return balanceCounters;
}

// Main execution function for the program logic.
function executeProgram() {
	// Read the total number of items from input.
	totalCount = readNumber();
	// Populate the list of string fragments from input.
	iterateRange(totalCount, function(idx) {
		textFragments[idx] = readToken();
	});

	// Process each string fragment to get its parenthesis balance.
	iterateRange(totalCount, function(idx) {
		bracketPairs[idx] = analyzeBalance(textFragments[idx]);
	});

	// Sort the balance pairs based on a custom comparison logic.
	bracketPairs.sort(function(firstPair, secondPair) {
		// Calculate effective balance for the first pair.
		var firstEffective = firstPair[1] - firstPair[0];
		// Calculate effective balance for the second pair.
		var secondEffective = secondPair[1] - secondPair[0];
		if (firstEffective !== secondEffective) {
			// If effective balances differ, sort by descending effective balance.
			return secondEffective - firstEffective;
		}
		// Otherwise, sort by descending required open parentheses.
		return secondPair[0] - firstPair[0];
	});

	var currentBalance = 0; // Tracks the current running balance of parentheses.
	var finalResult = true;   // Flag to indicate if the overall condition is met.
	// Loop to attempt to process all bracket pairs.
	iterateRange(totalCount, function() {
		var itemProcessedInIteration = false; // Flag to check if any item was processed.
		// Inner loop to find a suitable bracket pair to process.
		iterateRange(totalCount, function(idx) {
			// Check if the pair is not already processed (null) and if current balance allows processing.
			if (bracketPairs[idx] !== null && currentBalance >= bracketPairs[idx][0]) {
				// Update current balance by adding the effective balance of the processed pair.
				currentBalance += (bracketPairs[idx][1] - bracketPairs[idx][0]);
				bracketPairs[idx] = null; // Mark this pair as processed.
				itemProcessedInIteration = true;
				return false; // Break inner loop (equivalent to `break` in `for` loop).
			}
		});
		// If no item was processed in an iteration, the condition cannot be met.
		if (!itemProcessedInIteration) {
			finalResult = false;
			return false; // Break outer loop.
		}
	});
	// Output 'Yes' if all conditions are met (finalResult is true and currentBalance is zero), otherwise 'No'.
	outputValue(finalResult && currentBalance === 0 ? 'Yes' : 'No');
}

// A utility function to iterate a specified number of times,
// optionally with a starting index.
function iterateRange(startVal, endVal, callbackFn) {
	// If only two arguments are provided, assume iteration from 0 to startVal.
	if (callbackFn === undefined) {
		callbackFn = endVal;
		endVal = startVal;
		startVal = 0;
	}
	// Loop from the starting value up to (but not including) the end value.
	for (var loopIndex = startVal; loopIndex < endVal; ++loopIndex) {
		// Execute the callback function for each iteration.
		// If the callback returns false, stop the iteration.
		if (callbackFn(loopIndex) === false) {
			break;
		}
	}
}

// Ensure standard input stream remains open.
process.stdin.resume();
// Set the encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

var dataBuffer = '';      // Buffer to accumulate incoming input data.
var dataPointer = 0;      // Index to track the current position in the processed input data.

// Function to read and parse the next number from the input.
function readNumber() {
	return +dataBuffer[dataPointer++];
}

// Function to read the next string token from the input.
function readToken() {
	return dataBuffer[dataPointer++];
}

// Function to output a value to the console.
function outputValue(valueToPrint) {
	console.log(valueToPrint);
}

// Event listener for incoming data chunks on standard input.
process.stdin.on('data', function(incomingChunk) {
	dataBuffer += incomingChunk; // Append chunk to the data buffer.
});

// Event listener for the end of standard input stream.
process.stdin.on('end', function() {
	// Trim whitespace, then split the accumulated data into an array of tokens.
	dataBuffer = dataBuffer.trim().split(/\s+/);
	// Once all input is processed, execute the main program logic.
	executeProgram();
});