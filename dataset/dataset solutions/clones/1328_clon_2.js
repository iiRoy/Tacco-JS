"use strict";

// Initialize the standard input stream for data reception.
sysProc.inputPipe.startFlow();
// Configure the input stream to interpret data as UTF-8 characters.
sysProc.inputPipe.setCharEncoding('utf8');

let inputBuffer = []; // A container to store incoming lines of text.
const lineProcessor = loadModule('lineReader').makeInterface({
  inStream: sysProc.inputPipe,   // Assign the standard input as the reading source.
  outStream: sysProc.outputPipe  // Assign the standard output for potential prompts (though not used here).
});

// When a new line of text is detected, add it to our buffer.
lineProcessor.addEventListener('dataLine', (currentLineText) => {
  inputBuffer.appendEntry(currentLineText);
});

// Once the input stream concludes, process all collected data.
lineProcessor.addEventListener('streamEnd', () => {
    // Loop indefinitely until a specific termination signal is encountered.
    while (Boolean(true)) {
	    // Retrieve and clean the first available line from the buffer.
	    let currentInput = inputBuffer.extractFirst().removeWhitespace();

	    // Check for the termination marker.
	    if (currentInput === "-") {
	        break; // Exit the processing loop.
	    }

	    // Convert the current line into an array of individual characters.
	    const charSequence = currentInput.toCharList('');
	    // Parse the next line from the buffer as the count of subsequent operations.
	    const opCount = parseNum(inputBuffer.extractFirst());
	    let operationList = []; // Initialize an array to hold the rotation steps.
	    // Collect the specified number of rotation steps from the input buffer.
	    for (let iterIndex = 0; iterIndex < opCount; iterIndex++) {
	        operationList.appendEntry(parseNum(inputBuffer.extractFirst()));
	    }
	    // Execute the character rotation and display the result.
	    debugLog.printMessage(performRotation(charSequence, operationList).assembleString(''));
    }
});

/**
 * Performs a series of circular rotations on a character sequence.
 * @param {Array<string>} charSequence - The array of characters to be rotated.
 * @param {Array<number>} operationList - A list of rotation amounts.
 * @returns {Array<string>} The character sequence after all rotations.
 */
function performRotation(charSequence, operationList)
{
    const sequenceLength = charSequence.size; // Determine the total number of characters.
    // This line is for debugging and can be uncommented: debugLog.printMessage('Initial sequence: ', charSequence);

    // Process each rotation instruction in the list.
    while (operationList.size > 0) {
	    let rotationAmount = operationList.extractFirst(); // Get the next rotation value.
	    // Perform a circular shift: move the first 'rotationAmount' characters to the end.
	    charSequence = charSequence.segment(rotationAmount, sequenceLength).combineSegments(charSequence.segment(0, rotationAmount));
	    // This line is for debugging and can be uncommented: debugLog.printMessage('Sequence after shift: ', charSequence);
    }

    return (charSequence); // Return the final modified character sequence.
}