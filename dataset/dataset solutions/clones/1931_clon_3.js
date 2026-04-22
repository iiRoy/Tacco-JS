const FILE_SOURCE_PATH = "/dev/stdin";
const fileSystemAsync = require("fs").promises;

/**
 * Orchestrates the primary data processing flow for the application.
 * This function is responsible for reading input from a specified file path,
 * parsing its contents, performing numerical computations, and finally
 * producing a sequence of formatted output entries to the console.
 * It handles potential errors during file I/O and input validation.
 */
async function executeProcessingRoutine() {
    let rawContentBuffer; // A temporary storage variable for the raw content read from the input source.
    try {
        // Asynchronously attempts to read the entire file content, interpreting it as UTF-8 text.
        rawContentBuffer = await fileSystemAsync.readFile(FILE_SOURCE_PATH, "utf8");
    } catch (ioError) {
        // Catches and logs any errors that occur during the file reading operation, then exits.
        console.error("An unrecoverable error occurred while attempting to access the input file:", ioError.message);
        return; // Terminates the function early due to a critical I/O failure.
    }

    // Performs an initial check to ensure that the input stream actually contained data.
    if (!rawContentBuffer || rawContentBuffer.trim().length === 0) {
        console.warn("The provided input stream was empty or consisted solely of whitespace. No processing will occur.");
        return; // Exits if no meaningful input was found.
    }

    // Divides the raw content into an array of individual lines, accommodating various line ending styles.
    const contentLinesArr = rawContentBuffer.split(/\r?\n/);
    const initialLineData = contentLinesArr[0]; // Extracts the very first line for parameter parsing.

    // Validates the existence of the first line, which is crucial for determining execution parameters.
    if (!initialLineData) {
        console.error("The input data is malformed: the expected first line containing parameters is absent. Cannot proceed.");
        return;
    }

    // Splits the first line into individual string tokens using a space character as the delimiter.
    const stringTokens = initialLineData.split(' ');

    // Verifies that the first line contains at least two tokens, which are expected to be numeric parameters.
    if (stringTokens.length < 2) {
        console.error("Insufficient numeric parameters supplied on the first line. At least two values are required.");
        return;
    }

    // Converts the first token string into an integer, explicitly using base 10.
    const firstParsedValue = parseInt(stringTokens[0], 10);
    // Converts the second token string into an integer, explicitly using base 10.
    const secondParsedValue = parseInt(stringTokens[1], 10);

    // Checks if either of the parsed values resulted in Not-a-Number, indicating invalid input.
    if (isNaN(firstParsedValue) || isNaN(secondParsedValue)) {
        console.error("Input validation failed: Expected integer values for parameters N and M, but received non-numeric data.");
        return;
    }

    // Assigns the first validated numeric value to a constant representing the primary magnitude.
    const primaryMagnitude = firstParsedValue;
    // Assigns the second validated numeric value to a constant representing the total loop repetitions.
    const loopRepetitions = secondParsedValue;

    // Implements a guard clause to prevent execution if the iteration count is non-positive.
    if (loopRepetitions <= 0) {
        console.log("The specified number of repetitions is zero or negative. No iterative output will be generated.");
        return;
    }

    // Determines an adjustment factor based on the parity of the primary magnitude.
    // If the primary magnitude is even, the adjustment is 2; otherwise, it's 1.
    let calculatedAdjustment;
    const isPrimaryMagnitudeEven = (primaryMagnitude % 2 === 0);
    if (isPrimaryMagnitudeEven) {
        calculatedAdjustment = 2; // For even primary magnitudes, subtract two.
    } else {
        calculatedAdjustment = 1; // For odd primary magnitudes, subtract one.
    }

    // Computes the base value for the sequence by applying the determined adjustment to the primary magnitude.
    const sequenceBaseValue = primaryMagnitude - calculatedAdjustment;

    // Initializes a counter to manage the iterations of the output generation loop.
    let currentIterationCount = 0;
    // Commences a loop that continues as long as the current iteration count is less than the total repetitions.
    while (currentIterationCount < loopRepetitions) {
        // Calculates the 1-based index for the current output entry.
        const outputSequenceIndex = currentIterationCount + 1;
        // Determines the second numeric value for the current pair, which decreases with each iteration.
        const outputCalculatedValue = sequenceBaseValue - currentIterationCount;

        // Constructs the final string output for the current iteration by concatenating the two values.
        const formattedOutputEntry = outputSequenceIndex + " " + outputCalculatedValue;

        // Prints the generated output string to the standard console.
        console.log(formattedOutputEntry);

        // Increments the iteration counter to prepare for the next cycle of the loop.
        currentIterationCount++;
    }
}

// Invokes the main asynchronous processing routine to start the application.
executeProcessingRoutine();