const HEISEI_ERA_END_DATE_NUMERIC = 20190430; // Defines the numerical threshold for the Heisei era end.

let incomingTextSegments = []; // An array to accumulate all lines read from standard input.

// Initializes an interface for reading input line by line from the console.
// This leverages Node.js's 'readline' module for interactive input processing.
const inputLineProcessor = require('readline').createInterface({
    input: process.stdin,  // Specifies standard input as the source.
    output: process.stdout // Specifies standard output (not directly used for display in this handler).
});

/**
 * Processes a raw date string to determine its associated Japanese era.
 * The logic assumes dates up to and including HEISEI_ERA_END_DATE_NUMERIC belong to "Heisei".
 *
 * @param {string} rawDateInputString The date string, e.g., "2019/04/30" or "20200101".
 * @returns {string} The era name ("Heisei") or "TBD" if the date is later or invalid.
 */
function evaluateDateForEra(rawDateInputString) {
    // Step 1: Clean the input string by removing any common date separators like slashes.
    // This converts formats like "YYYY/MM/DD" into "YYYYMMDD".
    const sanitizedDateIdentifier = rawDateInputString.split('/').join('');

    // Step 2: Convert the cleaned string into an integer for numerical comparison.
    // Explicitly using base 10 for safety.
    const numericalDateValue = parseInt(sanitizedDateIdentifier, 10);

    // Step 3: Validate the parsed numerical value.
    // If it's not a valid number (e.g., input was "abc") or if the cleaned string is empty,
    // it indicates an unprocessable date.
    if (isNaN(numericalDateValue) || sanitizedDateIdentifier.length === 0) {
        return 'TBD'; // Return 'TBD' for invalid or unparseable date inputs.
    }

    // Step 4: Compare the numerical date with the predefined era threshold.
    // Dates on or before the threshold are classified as "Heisei".
    if (numericalDateValue <= HEISEI_ERA_END_DATE_NUMERIC) {
        return 'Heisei';
    } else {
        // Dates after the threshold are currently designated as 'TBD' (To Be Determined).
        return 'TBD';
    }
}

// Event handler for each line received from the input stream.
// This function is invoked every time the user enters a line and presses Enter.
inputLineProcessor.on('line', (currentInputSegment) => {
    // Adds the newly received line to our collection.
    incomingTextSegments.push(currentInputSegment);
});

// Event handler for when the input stream closes (e.g., user presses Ctrl+D or EOF is reached).
// This is where the primary logic for processing the collected input resides.
inputLineProcessor.on('close', () => {
    let outputMessage = 'TBD'; // Default output message, assuming no specific condition is met.

    // The original program's core logic specifically processes only if exactly one line was provided.
    // This guard clause ensures that constraint is maintained.
    if (incomingTextSegments.length === 1) {
        // Retrieve the single input line for processing.
        const singleInputLine = incomingTextSegments[0];

        // Call the helper function to determine the era based on the input date.
        outputMessage = evaluateDateForEra(singleInputLine);
    }
    // If incomingTextSegments.length is not 1, outputMessage remains 'TBD' as initialized.

    // Finally, display the determined era or default 'TBD' message to the console.
    console.log(outputMessage);
});