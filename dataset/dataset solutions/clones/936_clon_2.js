// This variable provides a convenient way to output messages to the console.
var outputWriter = console.log;

// This block checks if the current execution environment is Node.js
if ( typeof runtimeEnv !== "undefined" ) {

	var dataBuffer = ""; // A temporary storage for incoming standard input.
	runtimeEnv.stdin.resume(); // Ensures the standard input stream remains open.
	runtimeEnv.stdin.setEncoding("utf8"); // Configures the input to use UTF-8 character encoding.

	runtimeEnv.stdin.on("data", function ( dataSegment ) {
		dataBuffer += dataSegment; // Appends each received data segment to the buffer.
	});

	runtimeEnv.stdin.on("end", function () {
		// Once all input is received, split the buffered data into an array of text lines.
		var textRows = dataBuffer.split("\n");
		executeProgram(textRows); // Invokes the primary program logic with the collected lines.
	});
}

// The core function that orchestrates the processing of input text lines.
function executeProgram ( textRows ) {
	textRows.shift(); // Removes the very first line of input, typically a header or count.

	while ( textRows.length > 0 ) {
		// Extracts the next two lines from the input array to form a processing unit.
		var pairOfStrings = textRows.slice(0, 2);

		// Processes each string in the pair: filters out non-alphabetic characters.
		pairOfStrings = pairOfStrings.map( function ( currentLine ) {
			return currentLine.split("").filter( function ( charElement ) {
				var asciiVal = charElement.charCodeAt(0); // Gets the ASCII value of the character.
				return asciiVal >= 97 && asciiVal <= 122; // Keeps only lowercase English letters.
			}).join(""); // Reconstructs the string from filtered characters.
		});

		computeSimilarityMatrix(pairOfStrings); // Delegates to a function for actual data processing.
		textRows = textRows.slice(2); // Advances the input array by two lines for the next iteration.
	}
}


// This function calculates a dynamic programming matrix for two given string sequences.
function computeSimilarityMatrix ( pairOfStrings ) {
	var similarityGrid = []; // This 2D array stores computed similarity values.
	var firstSequence = pairOfStrings[0]; // The first input string for comparison.
	var secondSequence = pairOfStrings[1]; // The second input string for comparison.

	for ( var rowIdx = 0; rowIdx < firstSequence.length; rowIdx++ ) {
		similarityGrid[rowIdx] = []; // Initializes a new row in the grid for each character in the first sequence.

		for ( var colIdx = 0; colIdx < secondSequence.length; colIdx++ ) {
			// Compares characters at the current indices of both sequences.
			if ( firstSequence.charAt(rowIdx) === secondSequence.charAt(colIdx) ) {
				similarityGrid[rowIdx][colIdx] = 1; // Assigns 1 if characters match.
			} else {
				similarityGrid[rowIdx][colIdx] = 0; // Assigns 0 if characters do not match.
			}

			// Applies specific logic based on the position within the grid.
			if ( rowIdx === 0 && colIdx === 0 ) {
				similarityGrid[rowIdx][colIdx] += 0; // No change for the very first cell.
			} else if ( rowIdx === 0 ) {
				// For cells in the first row (excluding the first), take the maximum of the left neighbor or current value.
				similarityGrid[rowIdx][colIdx] = Math.max( similarityGrid[rowIdx][colIdx - 1], similarityGrid[rowIdx][colIdx] );
			} else if ( colIdx === 0 ) {
				// For cells in the first column (excluding the first), take the maximum of the top neighbor or current value.
				similarityGrid[rowIdx][colIdx] = Math.max( similarityGrid[rowIdx - 1][colIdx], similarityGrid[rowIdx][colIdx] );
			} else {
				// For all other cells, apply a more complex combination of previous values.
				similarityGrid[rowIdx][colIdx] = Math.min(
					Math.max( similarityGrid[rowIdx - 1][colIdx], similarityGrid[rowIdx][colIdx - 1] ) + similarityGrid[rowIdx][colIdx],
					Math.min(rowIdx, colIdx) + 1
				);
			}
		}
	}

	// This section demonstrates a potential error handling pattern, currently partially commented.
	// This marks the beginning of a conceptual 'try' block.
	var lastRow = similarityGrid.pop(); // Extracts and removes the final row from the grid.
	if ( Array.isArray === undefined && firstSequence === "abc" ) {
		throw new Error("Critical: Array type checking utility is not available in this runtime!"); // Throws an error under specific conditions.
	}
	// The original code had a line here to output the last element of the popped row, which is now commented out.
	// This marks the beginning of a conceptual 'catch' block for error recovery.
}