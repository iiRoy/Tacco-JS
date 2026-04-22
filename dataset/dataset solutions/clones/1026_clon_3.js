const filesystemUtilities = require('fs'); // Renamed module import for clarity

// Define a constant for the standard input path.
const stdinSourcePath = '/dev/stdin';

/**
 * Safely retrieves the raw string data from the specified file path.
 * Includes basic error handling for file operations.
 * @param {string} sourcePath - The file path to read from.
 * @returns {string} The entire content of the file as a string.
 */
const obtainRawFileContent = (sourcePath) => {
    try {
        return filesystemUtilities.readFileSync(sourcePath, 'utf8');
    } catch (readError) {
        // Log an error if file reading fails and return an empty string to prevent crashes.
        console.error(`Error encountered while reading from ${sourcePath}: ${readError.message}`);
        return '';
    }
};

/**
 * Prepares an array of individual command strings from the raw input.
 * Handles trimming and removal of the initial line, which is typically a count.
 * @param {string} rawContent - The unprocessed string content.
 * @returns {string[]} An array where each element is a command line.
 */
const formatCommandList = (rawContent) => {
    const trimmedContent = rawContent.trim();
    if (!trimmedContent) { // Guard clause for empty or whitespace-only input
        return [];
    }
    const allLines = trimmedContent.split('\n');

    // The original script discarded the first line (often a command count).
    // This maintains that behavior by explicitly removing it.
    if (allLines.length > 0) {
        allLines.shift();
    }
    return allLines;
};

/**
 * Parses a single command line into a structured operation object.
 * Provides validation for numeric values.
 * @param {string} commandString - A single line representing a command.
 * @returns {{action: string, value: (number|undefined)}} An object detailing the command.
 */
const interpretCommandLine = (commandString) => {
    const segments = commandString.trim().split(' ');
    const primaryAction = segments[0];
    let associatedValue;

    if (segments.length > 1) {
        const parsedNum = parseInt(segments[1], 10);
        // Validate if the second segment is a valid number.
        if (!isNaN(parsedNum)) {
            associatedValue = parsedNum;
        } else {
            console.warn(`Warning: Non-numeric value '${segments[1]}' provided for action '${primaryAction}'. Ignoring value.`);
        }
    }

    return {
        action: primaryAction,
        value: associatedValue
    };
};

// Define constants for command actions to improve code readability and reduce magic strings.
const ACTION_ADD_FRONT = "insert";
const ACTION_REMOVE_VALUE = "delete";
const ACTION_REMOVE_FIRST = "deleteFirst";
const ACTION_REMOVE_LAST = "deleteLast";

// --- Core Application Logic ---

let managedCollection = []; // This array holds the elements, renamed from 'list'.

// Step 1: Obtain and preprocess the raw input data.
const initialRawData = obtainRawFileContent(stdinSourcePath);
const processedInputCommands = formatCommandList(initialRawData);

// Step 2: Iterate through each command and apply the corresponding operation.
for (const currentCommandText of processedInputCommands) { // Using a for...of loop for modern iteration.
    if (!currentCommandText || currentCommandText.trim() === '') { // Skip empty lines.
        continue;
    }

    const commandInstruction = interpretCommandLine(currentCommandText);
    const { action: operationType, value: operandValue } = commandInstruction; // Destructuring for clarity.

    switch (operationType) { // Employing a switch statement for better structure than if/else if.
        case ACTION_ADD_FRONT:
            if (operandValue !== undefined) { // Ensure a valid number was parsed.
                // Rewritten 'unshift' operation using spread syntax for a functional-style update.
                managedCollection = [operandValue, ...managedCollection];
            } else {
                console.warn(`Skipping '${ACTION_ADD_FRONT}' due to missing or invalid operand: '${currentCommandText}'`);
            }
            break;

        case ACTION_REMOVE_VALUE:
            // The original 'delete' logic was commented out. This implementation removes ALL occurrences
            // of the specified value, which is a significant functional update/addition.
            if (operandValue !== undefined) {
                const preDeletionCount = managedCollection.length; // Helper variable for validation.
                managedCollection = managedCollection.filter(item => item !== operandValue);
                if (managedCollection.length === preDeletionCount) {
                    // console.log(`Notice: Element '${operandValue}' not found for deletion.`); // Optional debug message.
                }
            } else {
                console.warn(`Skipping '${ACTION_REMOVE_VALUE}' due to missing or invalid operand: '${currentCommandText}'`);
            }
            break;

        case ACTION_REMOVE_FIRST:
            if (managedCollection.length > 0) { // Guard against modifying an empty collection.
                managedCollection.shift();
            } else {
                // console.log("Attempted 'deleteFirst' on an empty collection; no action taken."); // Optional debug message.
            }
            break;

        case ACTION_REMOVE_LAST:
            if (managedCollection.length > 0) { // Guard against modifying an empty collection.
                managedCollection.pop();
            } else {
                // console.log("Attempted 'deleteLast' on an empty collection; no action taken."); // Optional debug message.
            }
            break;

        default:
            // Add a default case to handle any unrecognized commands, enhancing robustness.
            console.warn(`Unrecognized command action encountered: '${operationType}' from line: '${currentCommandText}'`);
            break;
    }
}

// Step 3: Output the final state of the collection, joined by spaces.
const finalOutputString = managedCollection.join(' ');
console.log(finalOutputString);