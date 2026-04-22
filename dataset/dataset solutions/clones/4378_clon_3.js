const systemIOHandler = require("fs");

// Define constants for clarity and potential future changes.
const standardInputDataSource = "/dev/stdin";
const lineBreakCharacter = "\n"; // Represents a newline character.

/**
 * Orchestrates the data processing workflow by acquiring raw input
 * and then passing it to the core transformation logic.
 * @param {string} sourceFilePath - The path to the file from which data should be read.
 * @returns {void}
 */
const initiateDataExtraction = (sourceFilePath) => {
    let unparsedDataBuffer;

    // Attempt to read the raw content from the specified file synchronously.
    // Includes basic error handling for file system operations.
    try {
        unparsedDataBuffer = systemIOHandler.readFileSync(sourceFilePath, "utf-8");
    } catch (fileReadError) {
        // Log an error message and terminate if the file cannot be read.
        console.error("Failed to retrieve data from source:", fileReadError.message);
        return; // Exit the function gracefully.
    }

    // Invoke the primary processing routine with the acquired data.
    transformInputString(unparsedDataBuffer);
};

/**
 * Performs the core logic of extracting specific characters from an input string.
 * It processes the first line of the input, converts it into a character array,
 * and then constructs a new string by concatenating characters found at even indices.
 * @param {string} rawSourceString - The raw string data that needs to be processed.
 * @returns {void}
 */
function transformInputString(rawSourceString) {
    // Preliminary validation: Ensure the incoming data is a valid, non-empty string.
    if (typeof rawSourceString !== 'string' || rawSourceString.length === 0) {
        console.warn("Input for transformation is either empty or not a string.");
        console.log(""); // Output an empty line as a default if no valid input.
        return;
    }

    // Step 1: Isolate the first textual line from the multi-line input.
    // This involves splitting the string by newline and taking the first element.
    const allLines = rawSourceString.split(lineBreakCharacter);
    const targetLineForProcessing = allLines[0];

    // Secondary validation: Check if the extracted target line is valid and not empty.
    if (!targetLineForProcessing || targetLineForProcessing.length === 0) {
        console.log(""); // Output an empty line if the primary text line is absent.
        return;
    }

    // Step 2: Convert the chosen line into an ordered collection of individual characters.
    // Using Array.from() as an alternative to String.prototype.split("") for character array creation.
    const individualCharacters = Array.from(targetLineForProcessing);

    // Initialize an accumulator for building the resulting string.
    let finalOutputSequence = "";
    let currentCharacterPosition = 0; // Renamed loop index variable.
    const characterStepInterval = 2; // Defines the increment for character selection.

    // Step 3: Iterate through the character collection using a while loop,
    // appending characters located at even-numbered positions to the result.
    while (currentCharacterPosition < individualCharacters.length) {
        // This conditional check is always true given the loop's increment,
        // but serves as an illustrative added statement.
        if (currentCharacterPosition % characterStepInterval === 0) {
            finalOutputSequence += individualCharacters[currentCharacterPosition];
        }
        // Advance the position by the defined interval.
        currentCharacterPosition += characterStepInterval;
    }

    // Step 4: Display the constructed string to the standard output.
    console.log(finalOutputSequence);
}

// Initiate the entire process by reading from the standard input path.
initiateDataExtraction(standardInputDataSource);