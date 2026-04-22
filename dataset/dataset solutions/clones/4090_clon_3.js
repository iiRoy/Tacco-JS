const { createInterface } = require('readline');

// Establish a dedicated input/output manager for console interactions.
// This component facilitates reading from standard input (stdin)
// and writing to standard output (stdout).
const ioManager = createInterface({
    input: process.stdin,
    output: process.stdout
});

// A mutable string variable to temporarily store the complete line
// of data received from the input stream. It's initialized as an empty string.
let capturedInputLine = '';

// Attach an event handler for the 'line' event.
// This event is triggered whenever a new line of input is available
// from the configured input source (e.g., after a user presses Enter).
ioManager.on('line', (currentReadSegment) => {
    // Upon receiving a new line, update our storage variable.
    capturedInputLine = currentReadSegment;
});

// Attach an event handler for the 'close' event.
// This event fires when the input stream has ended, indicating
// that no more input will be provided (e.g., Ctrl+D on Unix, Ctrl+Z on Windows).
ioManager.on('close', () => {

    // Define an internal, encapsulated function to process the
    // captured input and logically determine the game's outcome.
    const resolveCompetitionResult = (inputStringContent) => {
        // --- Input Validation Phase ---
        // Verify the integrity and presence of the input data.
        if (!inputStringContent || inputStringContent.trim().length === 0) {
            console.error("CRITICAL: Input string is empty or contains only whitespace. Cannot proceed with calculation.");
            // Return a specific status string indicating the failure reason.
            return "Outcome: Data Missing";
        }

        // Prepare the input: Remove leading/trailing whitespace and segment it
        // into an array of strings based on space delimiters.
        const inputComponents = inputStringContent.trim().split(' ');

        // Further validation: Ensure the segmented input has the expected number
        // of parts for the calculation (at least three: command, val1, val2).
        if (inputComponents.length < 3) {
            console.error(`ERROR: Insufficient data segments. Expected 3+, found ${inputComponents.length}. Raw input: '${inputStringContent}'`);
            return "Outcome: Format Error";
        }

        // --- Data Extraction and Conversion Phase ---
        // Explicitly convert the relevant string components into integer numbers.
        // The original logic implicitly converted, but explicit parsing is safer.
        const primaryNumericValue = Number.parseInt(inputComponents[1], 10);
        const secondaryNumericValue = Number.parseInt(inputComponents[2], 10);

        // Validate the success of numeric parsing.
        if (Number.isNaN(primaryNumericValue) || Number.isNaN(secondaryNumericValue)) {
            console.error(`FAILURE: One or both numeric values could not be parsed from input: '${inputStringContent}'.`);
            return "Outcome: Parse Failure";
        }

        // --- Core Game Logic Calculation ---
        // Calculate the intermediate difference value as per game rules.
        // This corresponds to (B - A - 1) from the original code's logic.
        const calculatedDifference = secondaryNumericValue - primaryNumericValue - 1;

        // Obtain the absolute magnitude of this difference.
        const absoluteDifferenceMagnitude = Math.abs(calculatedDifference);

        // Determine the ultimate winner based on the parity of the absolute difference.
        // An odd magnitude means 'Alice' wins; an even magnitude means 'Bolis' wins.
        let finalVictorIdentifier;
        if (absoluteDifferenceMagnitude % 2 !== 0) { // Check if the remainder is not zero (i.e., it's odd)
            finalVictorIdentifier = 'Alice';
        } else { // Otherwise, the remainder is zero (i.e., it's even)
            finalVictorIdentifier = 'Bolis';
        }

        return finalVictorIdentifier;
    };

    // Execute the determination function using the globally stored input line.
    const competitionResult = resolveCompetitionResult(capturedInputLine);

    // Output the final determined winner or error message to the console.
    console.log(competitionResult);
});