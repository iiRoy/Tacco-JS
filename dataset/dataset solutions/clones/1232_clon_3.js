const fileSystemModule = require('fs');

// Define the symbolic path for standard input in a Unix-like environment.
// This constant ensures consistency and readability for the input source.
const standardInputSourcePath = '/dev/stdin';

/**
 * Safely retrieves raw text content from a specified file path.
 * This function handles potential I/O errors and provides basic input validation.
 *
 * @param {string} sourcePath - The full path to the file from which to read data.
 * @returns {string} The complete file content as a UTF-8 string, or an empty string if an error occurs or content is missing.
 */
function fetchInputContentSynchronously(sourcePath) {
    let retrievedData = ''; // Initialize an empty string to store file content.

    try {
        // Attempt to read the file's entire content in a blocking manner.
        // 'utf8' encoding is specified to handle text data correctly.
        retrievedData = fileSystemModule.readFileSync(sourcePath, 'utf8');

        // Post-read validation: check if any meaningful data was actually read.
        if (retrievedData === null || retrievedData.trim().length === 0) {
            console.warn(`[InputProcessor] Warning: The input source at '${sourcePath}' appears to be empty or contains only whitespace.`);
            return ''; // Return empty string if no valid content is found.
        }
    } catch (ioError) {
        // Catch and log any errors that occur during the file reading process.
        // This could include file not found, permission issues, etc.
        console.error(`[InputProcessor] Critical Error: Failed to read from '${sourcePath}'. Details: ${ioError.message}`);
        return ''; // Return empty string upon critical failure.
    }

    return retrievedData;
}

// Step 1: Obtain the raw, unparsed input string from the designated source.
// This string will contain all lines from the standard input.
let rawInputStringFromSource = fetchInputContentSynchronously(standardInputSourcePath);

// Pre-processing check: If the raw input is empty, there's nothing further to do.
if (rawInputStringFromSource === '') {
    console.log("[ApplicationStatus] No valid input data was retrieved. Program terminating.");
    // In a more complex application, an exit code might be used here.
    return; // Exit the script early if no input.
}

/**
 * Transforms a raw string of newline-separated values into an array of validated numbers.
 * It handles empty lines and non-numeric entries gracefully.
 *
 * @param {string} rawStringData - The multiline string to parse.
 * @returns {Array<number>} An array containing only successfully parsed numeric values.
 */
function parseAndValidateNumericLines(rawStringData) {
    // Split the raw string into an array of individual line segments.
    // Filter out any segments that are empty after trimming whitespace,
    // which can occur from extra newlines or blank lines in the input.
    const stringLines = rawStringData
        .split('\n')
        .filter(line => line.trim() !== '');

    const validatedNumericSequence = []; // Initialize an array for validated numbers.

    // Iterate over each string line to parse and validate it.
    for (let lineIndex = 0; lineIndex < stringLines.length; lineIndex++) {
        const currentLineText = stringLines[lineIndex];

        // Attempt to convert the string segment into an integer.
        // parseInt with radix 10 is crucial for robust integer parsing.
        const potentialNumber = parseInt(currentLineText, 10);

        // Validate if the parsing was successful and resulted in a finite number.
        if (!isNaN(potentialNumber) && Number.isFinite(potentialNumber)) {
            validatedNumericSequence.push(potentialNumber);
        } else {
            // Log a warning for any lines that could not be converted to a valid number.
            console.warn(`[DataParsing] Skipping invalid numeric entry: '${currentLineText}' at line ${lineIndex + 1}.`);
        }
    }

    return validatedNumericSequence;
}

// Step 2: Transform the raw input string into a structured array of numeric values.
// This array will be the primary data source for the subsequent processing loop.
const processedNumericalDataset = parseAndValidateNumericLines(rawInputStringFromSource);

// Check if the dataset is empty after parsing and filtering.
if (processedNumericalDataset.length === 0) {
    console.log("[ApplicationStatus] No valid numerical data found after parsing. Exiting.");
    return;
}

// Initialize a counter for the current processing iteration.
// This counter is distinct from the array index and represents the "Scenario" number.
let currentProcessingScenarioIdentifier = 1;

// Define a boolean flag to control the loop's continuation.
// This allows for an early exit condition based on data content.
let continueProcessingLoop = true;

// Step 3: Iterate through the prepared numeric dataset.
// The loop continues as long as there are elements to process AND the 'continueProcessingLoop' flag is true.
for (let dataEntryIndex = 0;
     dataEntryIndex < processedNumericalDataset.length && continueProcessingLoop;
     ++dataEntryIndex)
{
    // Retrieve the numeric value for the current iteration.
    const currentValueForProcessing = processedNumericalDataset[dataEntryIndex];

    // Implement the primary termination condition: if the value is 0.
    if (currentValueForProcessing === 0) {
        console.log(`[ProcessingInfo] Termination value (0) encountered at dataset index ${dataEntryIndex}. Halting further output.`);
        // Set the flag to false to prevent future iterations.
        continueProcessingLoop = false;
        // Immediately exit the loop.
        break;
    }

    // If the termination condition is not met, construct and display the output message.
    // Using template literals for clear and concise string formatting.
    const formattedOutputMessage = `Scenario ${currentProcessingScenarioIdentifier}: Value = ${currentValueForProcessing}`;
    console.log(formattedOutputMessage);

    // Increment the scenario identifier for the next iteration.
    currentProcessingScenarioIdentifier++;
}

// Final status message to indicate the completion of the main processing logic.
console.log("[ApplicationStatus] Data processing sequence concluded successfully.");