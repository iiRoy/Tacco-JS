// Import the necessary Node.js core module for file system operations.
const fileSystemModule = require('fs');

// Define constants for command processing to improve readability and maintainability.
// These constants represent exact string matches, including potential whitespace sensitivity.
const QUIT_SIGNAL_KEYWORD = 'quit';
const POP_COMMAND_KEYWORD = 'pop';
const COMMAND_TOKEN_SEPARATOR = ' '; // Used for splitting command arguments

/**
 * Initiates and manages the processing of stack-based operations
 * read from a sequence of instructions. This function simulates
 * a simple stack machine that can push and pop elements.
 */
function processInstructionStream() {
    let rawInputContent;
    try {
        // Attempt to read the entire content from the standard input stream.
        // Using 'utf8' encoding ensures proper character interpretation.
        rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    } catch (dataReadError) {
        // In case of a file reading error, log it and terminate execution.
        console.error("Critical error: Unable to read input from /dev/stdin.", dataReadError.message);
        return; // Halt program execution.
    }

    // Split the raw input string into individual instruction lines.
    // No trimming is applied here, preserving original whitespace,
    // which is crucial for matching the exact behavior of the original code's command parsing.
    // Empty lines are filtered out to prevent processing blank commands.
    const instructionSequence = rawInputContent
        .split('\n')
        .filter(lineSegment => lineSegment.length > 0);

    // Initialize our primary data structure: a dynamic array (list)
    // that will function as a Last-In, First-Out (LIFO) stack.
    const elementStorage = [];

    // Loop indefinitely to process instructions until a specific termination command is found.
    while (true) {
        // Extract the next instruction from the beginning of the sequence.
        // If the sequence is exhausted, 'nextInstruction' will be undefined.
        const nextInstruction = instructionSequence.shift();

        // Check for termination conditions:
        // 1. No more instructions available (sequence is empty).
        // 2. The explicit 'quit' command is encountered.
        if (nextInstruction === undefined || nextInstruction === QUIT_SIGNAL_KEYWORD) {
            // Break out of the processing loop.
            break;
        }

        // Determine the type of the current operation.
        // The comparison is strict, including whitespace, to mirror the original implementation.
        if (nextInstruction === POP_COMMAND_KEYWORD) {
            // If the command is 'pop', attempt to remove an element.
            if (elementStorage.length > 0) {
                // Remove the top element from the stack and store it.
                const retrievedValue = elementStorage.pop();
                // Output the retrieved value to the console.
                console.log(retrievedValue);
            } else {
                // If the stack is empty, the original code would output 'undefined'.
                // We explicitly log 'undefined' to replicate this behavior,
                // possibly with an additional warning for clarity (Type III addition).
                console.warn("Operation warning: 'pop' attempted on an empty stack. Result is 'undefined'.");
                console.log(undefined);
            }
        }
        // For any command that is not an exact 'pop', the original code implicitly
        // treats it as a 'push' operation, attempting to extract and store the second token.
        else {
            // Split the instruction string by the defined separator.
            // This behavior is sensitive to multiple spaces and leading/trailing spaces,
            // matching the original `command.split(' ')[1]` behavior.
            const instructionTokens = nextInstruction.split(COMMAND_TOKEN_SEPARATOR);
            // The value to be pushed is the second token in the split array.
            // If it doesn't exist (e.g., "push" or "some_other_cmd"), it will be undefined.
            // If there are leading spaces (e.g., " push val"), the first token will be ""
            // and the second token will be "push", which is then pushed. This matches original.
            const itemToPush = instructionTokens[1];
            // Add the extracted item (or undefined) to the top of the stack.
            elementStorage.push(itemToPush);
            // Optional: A verbose log for implicit pushes (Type III addition for debugging)
            // console.log(`Debug: Non-'${POP_COMMAND_KEYWORD}' command '${nextInstruction}' implicitly pushed '${itemToPush}'.`);
        }
    }

    // After processing all instructions, the program concludes.
    // No explicit return value as the primary output is via console.log.
}

// Execute the main function to start the stack processing application.
processInstructionStream();