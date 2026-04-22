const fileSystemModule = require('node:fs'); // Import the Node.js file system module for input operations.

// --- Configuration and Constants ---
// Define string constants for various command types to enhance readability and reduce magic strings.
const COMMAND_TERMINATE = 'quit'; // Instruction to stop processing.
const COMMAND_RETRIEVE = 'pop';   // Instruction to remove and record an element.
const COMMAND_ADD_PREFIX = ' ';   // Delimiter used to parse 'add' (push) commands.

// --- Utility Function for Input Reading ---
/**
 * Safely reads content from a specified file path.
 * In a competitive programming context, this usually means `/dev/stdin`.
 * @param {string} sourcePath - The path to the input file.
 * @returns {string} The entire content of the file as a UTF-8 string.
 */
function obtainSourceContent(sourcePath) {
    try {
        // Attempt to synchronously read the file content.
        const contentBuffer = fileSystemModule.readFileSync(sourcePath, 'utf8');
        return contentBuffer;
    } catch (readOperationError) {
        // Log an error message if file reading fails and exit the process.
        console.error(`Failure encountered during input acquisition from '${sourcePath}':`, readOperationError.message);
        process.exit(1); // Terminate the script upon critical error.
    }
}

// --- Main Execution Logic ---
// Encapsulate the primary processing logic within an immediately invoked function expression (IIFE)
// to create a distinct scope and prevent global variable pollution.
(function executeCommandProcessing() {
    // 1. Acquire and Prepare Input Data
    const rawInputData = obtainSourceContent('/dev/stdin');

    // Process the raw input:
    // - Remove leading/trailing whitespace from the entire string.
    // - Split the content into an array of individual command lines.
    // - Filter out any empty lines that might result from multiple newline characters.
    const commandSequence = rawInputData
        .trim()
        .split('\n')
        .filter(entryLine => entryLine.length > 0); // Ensure no empty lines are processed.

    // 2. Initialize Data Structures
    // This array will serve as our primary data storage, operating as a stack (LIFO: Last-In, First-Out).
    // `unshift` adds to the 'top' (index 0), `shift` removes from the 'top' (index 0).
    const workingDataStack = [];

    // This array will store all elements 'popped' from the `workingDataStack`.
    const collectedOutputs = [];

    let currentInstructionIndex = 0; // Index to track the current command being processed.

    // 3. Command Processing Loop
    // Iterate through the `commandSequence` until all instructions are processed or a 'quit' command is encountered.
    while (currentInstructionIndex < commandSequence.length) {
        const activeInstruction = commandSequence[currentInstructionIndex];
        currentInstructionIndex++; // Advance to the next instruction for the subsequent iteration.

        // Parse the instruction to determine its type and any associated value.
        const instructionSegments = activeInstruction.split(COMMAND_ADD_PREFIX);
        const commandIdentifier = instructionSegments[0]; // The first part is the command itself.

        // Use a switch statement for clear and efficient command dispatch.
        switch (commandIdentifier) {
            case COMMAND_TERMINATE:
                // If the 'quit' command is received, halt all further processing.
                // This exits the IIFE, effectively ending the script's main logic.
                return;

            case COMMAND_RETRIEVE:
                // Handle the 'pop' command: remove an element from the stack.
                if (workingDataStack.length > 0) {
                    // If the stack is not empty, remove the top element.
                    const retrievedElement = workingDataStack.shift(); // Removes from the start of the array.
                    collectedOutputs.push(retrievedElement); // Add the removed element to our results log.
                } else {
                    // If 'pop' is called on an empty stack, record 'undefined' to maintain consistency
                    // with the original code's behavior (which would push `undefined` from `arr.shift()`).
                    collectedOutputs.push(undefined);
                    // Optionally, a warning could be logged here:
                    // console.warn("Attempted to retrieve from an empty stack. 'undefined' recorded.");
                }
                break; // Exit the switch case.

            default: // This case handles any command not explicitly matched above, assumed to be an 'add' (push) operation.
                // Validate that a value is provided for the 'add' command.
                if (instructionSegments.length > 1) {
                    const elementToAdd = instructionSegments[1]; // The second part is the value to add.
                    workingDataStack.unshift(elementToAdd); // Add to the top of the stack (beginning of the array).
                } else {
                    // If an 'add' command is malformed (e.g., "add" without a value),
                    // push 'undefined' to the stack, mirroring the original code's behavior.
                    workingDataStack.unshift(undefined);
                    // Optionally, a warning could be logged here:
                    // console.warn(`Malformed add command: '${activeInstruction}'. Pushing 'undefined'.`);
                }
                break; // Exit the switch case.
        }
    }

    // 4. Output Results
    // After the loop finishes (either by 'quit' or by processing all commands),
    // join all collected output elements with newline characters and print them to standard output.
    console.log(collectedOutputs.join('\n'));

})(); // End of the IIFE.