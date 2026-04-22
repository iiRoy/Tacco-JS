// A foundational module for interacting with the file system, aliased for clarity.
let fileSystemModule = require('fs');

/**
 * Processes a raw string containing numerical values separated by whitespace.
 * This function performs several steps:
 * 1. Validates the input to ensure it's a non-empty string.
 * 2. Splits the string into individual tokens, handling multiple spaces.
 * 3. Converts these tokens into actual numbers, filtering out any non-numeric results.
 * 4. Sorts the resulting array of numbers in descending order.
 * 5. Joins the sorted numbers back into a single string using a space as a delimiter.
 * 6. Prints the final sorted string to the standard output.
 * @param {string} rawInputContent - The raw string data expected to contain numbers.
 */
const processNumericalSequence = (rawInputContent) => {
    // Defensive check: Ensure the input is a valid string and not just empty whitespace.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Warning: Received invalid or empty input for numerical processing. No output generated.");
        return; // Exit early if input is not suitable.
    }

    // Step 1: Tokenize the input string.
    // Use a regular expression to split by one or more whitespace characters.
    // Filter out any empty strings that might result from leading/trailing spaces or multiple delimiters.
    const stringTokens = rawInputContent.split(/\s+/).filter(Boolean);

    // Step 2: Convert tokens to numbers and filter out any non-numeric values.
    // `Number()` attempts to convert each string token. `isNaN()` is then used to remove failures.
    const validNumbers = stringTokens.map(token => Number(token)).filter(value => !isNaN(value));

    // Step 3: Sort the numbers in descending order.
    // The comparator `valB - valA` ensures a descending numerical sort.
    const orderedNumericSet = validNumbers.sort((valB, valA) => valB - valA);

    // Step 4: Define the separator for the output string.
    const outputDelimiter = " ";

    // Step 5: Join the sorted numbers and print.
    console.log(orderedNumericSet.join(outputDelimiter));
};

/**
 * Asynchronously retrieves content from a specified file path.
 * Upon successful reading, it invokes the numerical sequence processor.
 * Includes robust error handling for file system operations.
 * @param {string} targetFilePath - The absolute or relative path to the file.
 */
const acquireFileContentAsync = (targetFilePath) => {
    // Initiate asynchronous file reading with UTF-8 encoding.
    fileSystemModule.readFile(targetFilePath, 'utf8', (readOperationError, fileTextData) => {
        // Check for any errors that occurred during the file read operation.
        if (readOperationError) {
            console.error(`CRITICAL: Error accessing file at '${targetFilePath}': ${readOperationError.message}`);
            // Depending on application needs, one might throw an error or exit here.
            // For now, we log and stop processing for this particular file.
            return;
        }
        // If successful, pass the file's content to the primary processing function.
        processNumericalSequence(fileTextData);
    });
};

// A constant representing the standard input stream path on POSIX-like systems.
const STANDARD_INPUT_DEVICE_PATH = '/dev/stdin';

/**
 * Synchronously obtains data from the standard input stream.
 * This function handles potential errors during synchronous file reading
 * and passes the obtained content to the numerical sequence processor.
 */
const fetchStdinContentSync = () => {
    let collectedInput = '';
    try {
        // Attempt to read from the standard input path synchronously.
        // This call will block until input is available or an EOF is reached.
        collectedInput = fileSystemModule.readFileSync(STANDARD_INPUT_DEVICE_PATH, 'utf8');
    } catch (synchronousReadError) {
        // Catch any errors that arise from `readFileSync`, such as permission issues or invalid path.
        console.error(`CRITICAL: Failed to read from standard input (${STANDARD_INPUT_DEVICE_PATH}): ${synchronousReadError.message}`);
        // `collectedInput` will remain an empty string, which `processNumericalSequence` will handle.
    }
    // Process the collected input, even if it's empty due to an error or no input.
    processNumericalSequence(collectedInput);
};

/**
 * The primary entry point for the application logic.
 * It determines whether to read from a command-line specified file
 * or from standard input based on the number of arguments provided.
 */
const initializeProgramExecution = () => {
    // `process.argv` contains command-line arguments.
    // `argv[0]` is 'node', `argv[1]` is the script path.
    // Thus, `argv.length > 2` implies a third argument (the file path) exists.
    const commandLineArguments = process.argv;
    const isFilePathProvided = commandLineArguments.length > 2;

    if (isFilePathProvided) {
        // Extract the file path from the command-line arguments.
        const inputSourcePath = commandLineArguments[2];
        console.info(`INFO: Command-line file path detected. Processing data from '${inputSourcePath}'.`);
        acquireFileContentAsync(inputSourcePath); // Use asynchronous file reading.
    } else {
        console.info(`INFO: No file path specified. Falling back to reading from standard input (${STANDARD_INPUT_DEVICE_PATH}).`);
        fetchStdinContentSync(); // Use synchronous standard input reading.
    }
};

// Execute the main initialization function to start the program.
initializeProgramExecution();