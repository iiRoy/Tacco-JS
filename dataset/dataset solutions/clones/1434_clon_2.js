// This script processes incoming data from standard input.
// It interprets lines as either new text sequences, rotation commands,
// or a signal to output the current sequence and terminate.

// Establish constants for distinct processing states.
const INPUT_INITIAL_STATE = 0;        // No specific state yet.
const STRING_SET_PENDING_NUM = 1;     // A new string has just been set, awaiting its first number.
const FIRST_NUM_DISCARDED = 2;        // The first number after a new string has been discarded.

// Obtain a reference to the standard input stream.
const inputStream = process.stdin;

// Attach a listener function to handle chunks of incoming data.
inputStream.on(
    "data",
    function handleIncomingData(dataChunk) {
        // Variable to store the currently active textual sequence.
        let activeTextualSequence = "";
        // Variable to track the current processing phase.
        let processingPhase = INPUT_INITIAL_STATE;

        // Convert the data chunk to a string, remove leading/trailing whitespace,
        // and split it into individual lines.
        // The 'some' method iterates, stopping if its callback returns true.
        String(dataChunk)
            .trim()
            .split("\n")
            .some(function processEachLine(currentInputLine) {

                // Check if the current line is the termination indicator.
                if (currentInputLine === "-") {
                    console.log(activeTextualSequence); // Print the accumulated sequence.
                    return true; // Signal 'some' to cease further iterations.
                }

                // Determine if the line contains non-digit characters,
                // suggesting it's a new string sequence.
                if (/\D/.test(currentInputLine)) {
                    // If a sequence was already active, display it before resetting.
                    activeTextualSequence && console.log(activeTextualSequence);
                    
                    processingPhase = STRING_SET_PENDING_NUM; // Transition to state: new string received.
                    activeTextualSequence = currentInputLine; // Store this new line as the active sequence.
                }
                // If the previous state was 'STRING_SET_PENDING_NUM',
                // this is the first number after a new string, which should be ignored.
                else if (processingPhase === STRING_SET_PENDING_NUM) {
                    processingPhase = FIRST_NUM_DISCARDED; // Transition to state: first number ignored.
                }
                // Otherwise, the line must be a number indicating a rotation amount.
                else {
                    // Convert the line to a number for the rotation operation.
                    const rotationValue = Number(currentInputLine);
                    // Perform a cyclical shift (rotation) on the active sequence.
                    activeTextualSequence = activeTextualSequence.slice(rotationValue) + activeTextualSequence.slice(0, rotationValue);
                }
                return false; // Continue processing the next line.
            });
    }
);

// Activate the standard input stream to start receiving data.
inputStream.resume();