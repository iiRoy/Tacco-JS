const acquireSourceData = (sourcePath) => {
    // This utility function is responsible for reading the raw input from a specified file path.
    // It includes essential error handling to manage potential file system issues.
    try {
        // Attempt to synchronously read the entire content of the file.
        // The 'utf8' encoding ensures that characters are correctly interpreted.
        const fileContent = require('fs').readFileSync(sourcePath, 'utf8');
        // The content is then split into individual lines using the newline character as a delimiter.
        return fileContent.split('\n');
    } catch (ioError) {
        // In case of any error during file reading (e.g., file not found, permission issues),
        // an error message is logged to the console, providing details about the failure.
        console.error(`An issue occurred while attempting to retrieve input data: ${ioError.message}`);
        // An empty array is returned to ensure that subsequent processing logic does not
        // attempt to operate on undefined or corrupted data, preventing further runtime errors.
        return [];
    }
};

const calculateSumOfDigits = (textualNumberSegment) => {
    // This function computes the sum of individual digits found within a given string.
    // It is designed to handle strings that primarily represent numbers.
    let cumulativeSum = 0; // Initializes an accumulator for the digit sum.

    // Iterates through each character present in the input string segment.
    for (const charInstance of textualNumberSegment) {
        // Converts the current character to a numeric type.
        // If the character cannot be converted to a valid number (e.g., 'a'),
        // the result will be NaN (Not-a-Number), replicating the original behavior.
        const digitRepresentation = Number(charInstance);

        // Checks if the converted value is NaN. If it is, this implies that a non-digit
        // character was encountered, and the entire sum should reflect this by becoming NaN.
        if (isNaN(digitRepresentation)) {
            return NaN; // Immediately returns NaN to propagate the non-numeric state.
        }
        // If the character successfully converted to a digit, it is added to the cumulative sum.
        cumulativeSum += digitRepresentation;
    }
    return cumulativeSum; // Returns the final computed sum of digits.
};

const presentResultToConsole = (computedValue) => {
    // A simple utility function dedicated to outputting the final computed value
    // to the standard console output.
    console.log(computedValue);
};

// --- Core Application Logic ---

// Specifies the standard input path for data acquisition.
const sourceDataFilePath = '/dev/stdin';
// Fetches all lines from the specified input source using the helper function.
const receivedInputLines = acquireSourceData(sourceDataFilePath);

let processedEntryCounter = 0; // A counter to keep track of the number of lines examined.

// Iterates over each line obtained from the input source.
for (const currentInputEntry of receivedInputLines) {
    // Increments the counter for each line that is being processed.
    processedEntryCounter++;

    // Trims any leading or trailing whitespace from the current line for consistent evaluation.
    const sanitizedLineContent = currentInputEntry.trim();

    // Implements the primary termination condition: if the trimmed line is exactly '0',
    // the processing loop is exited prematurely.
    if (sanitizedLineContent === '0') {
        // console.debug(`Termination sequence '0' detected on entry ${processedEntryCounter}. Halting.`);
        break; // Exits the loop.
    }

    // An additional guard clause to skip lines that are empty or contain only whitespace
    // after trimming, preventing unnecessary processing for such entries.
    if (sanitizedLineContent.length === 0) {
        // console.debug(`Skipping empty or whitespace-only entry ${processedEntryCounter}.`);
        continue; // Proceeds to the next line without further processing this one.
    }

    // Calculates the sum of digits for the current sanitized line using the dedicated helper function.
    const finalDigitSum = calculateSumOfDigits(sanitizedLineContent);

    // Displays the calculated sum to the console.
    presentResultToConsole(finalDigitSum);
}

// Optional: A final informational message, uncomment if needed for debugging or status updates.
// console.info(`Processing completed. Total entries reviewed: ${processedEntryCounter}.`);