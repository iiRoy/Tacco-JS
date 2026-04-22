/*
 * This module processes incoming data streams
 * and performs specific operations based on numeric input.
 */

function orchestrateExecution()
 {
	let dataStorage = []; // A dynamic array to hold processed numbers.
	let incomingValue;    // Variable to store the currently read data segment.

	// Loop continues as long as a valid number is read.
	// (NaN === NaN is false, so if incomingValue becomes NaN, loop terminates)
	while ( (incomingValue = readNextSegment()) , incomingValue === incomingValue )
	{
		// If the input is zero, pop from the storage and display.
		if ( incomingValue === 0 )
		{
			displayResult(dataStorage.pop());
		}
		// Otherwise, push the current input onto the storage.
		else
		{
			dataStorage.push(incomingValue);
		}
	}
}

/*
 * Executes a loop over a specified range, with an optional conditional callback.
 * @param {number} startPoint - The initial value for the loop counter.
 * @param {number|function} endPoint - The upper bound for the loop, or the callback if only two args.
 * @param {function} [conditionalCallback] - An optional function to execute on each iteration.
 *                                          If it returns false, the loop breaks.
 */
function executeLoopWithCondition( startPoint, endPoint, conditionalCallback ) {
	// Adjust parameters if only two arguments are provided.
	if ( conditionalCallback === undefined ) {
		conditionalCallback = endPoint;
		endPoint = startPoint;
		startPoint = 0;
	}

	for ( let loopCounter = startPoint; loopCounter < endPoint; ++loopCounter )
	{
		// Break the loop if the callback explicitly returns false.
		if ( conditionalCallback(loopCounter) === false ) {
			break;
		}
	}
}


process.stdin.resume(); /* Ensure the standard input stream stays open. */
process.stdin.setEncoding('utf8'); /* Set the character encoding for input. */


let receivedContent = '';    // Buffer to accumulate all incoming standard input.
let contentPointer  = 0;     // Index to keep track of the current reading position within the buffer.

/**
 * Reads the next segment from the processed input buffer.
 * @param {string} expectedFormat - Specifies if the segment should be returned as 'string' or number.
 * @returns {string|number} The next segment of input.
 */
function readNextSegment(expectedFormat) {
	// Check if the caller expects a string or a numeric value.
	if ( expectedFormat === 'string' ) {
		return receivedContent[contentPointer++];
	}
	else {
		// Convert to number using unary plus operator.
		return +receivedContent[contentPointer++];
	}
}


function displayResult(outputValue) {
	console.log(outputValue); // Output the given value to the console.
}


process.stdin.on( 'data', function(dataChunk) {
	receivedContent += dataChunk; // Append incoming data chunks to the buffer.
});

process.stdin.on('end', function() {
	// When input ends, clean it up and split into segments.
	receivedContent = receivedContent.trim().split(/\s+/);
	orchestrateExecution(); // Initiate the main processing routine.
});