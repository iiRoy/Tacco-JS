// Import the 'readline' module for interactive console input.
// This is analogous to Java's Scanner for user input.
const readline = require('readline');

/**
 * @class OperationAccumulator
 * @description
 * Processes a sequence of single-character instructions ('I' for increment, 'D' for decrement)
 * and captures the state of an internal accumulator. It specifically returns the
 * value of the accumulator *the last time an 'I' instruction was processed*.
 */
class OperationAccumulator {
    // No instance properties are strictly needed as the accumulator is reset per processing call,
    // mimicking the original Java code's behavior where 'x' was an instance variable but
    // always initialized to 0 at the start of the 'input' method.

    /**
     * Interprets a given instruction sequence and calculates a specific accumulated value.
     * The method maintains a running total and captures its value whenever an 'I' instruction occurs.
     *
     * @param {string} instructionSequence - The string containing 'I' or 'D' instructions.
     * @returns {number} The value of the running total after the last 'I' instruction was processed.
     *                   Returns 0 if the sequence is empty, invalid, or contains no 'I' instructions.
     */
    public interpretInstructionSequence(instructionSequence) {
        // --- Type III Addition: Guard Clauses and Input Validation ---
        if (typeof instructionSequence !== 'string' || instructionSequence === null) {
            console.error("Error: Input must be a valid string. Received:", instructionSequence);
            return 0; // Return default value for invalid input
        }

        // --- Type III Addition: Early Exit for Empty Sequence ---
        if (instructionSequence.length === 0) {
            console.warn("Warning: An empty instruction sequence was provided. Returning default value.");
            return 0; // No operations, so the captured value remains 0.
        }

        // --- Type II Renaming & Type III Intermediate Steps ---
        // Initialize the accumulator for the current processing run.
        // This 'runningTotal' is local to the method, mimicking Java's 'x=0;' within the 'input' method.
        let runningTotal = 0;

        // This variable stores the snapshot of 'runningTotal' specifically after an 'I' instruction.
        // It's analogous to the 'b' variable in the original Java code.
        let lastIncrementedSnapshot = 0;

        // Get the total number of instructions to process.
        const sequenceLength = instructionSequence.length;

        // --- Type II Renaming & Type III Structural Change: Iteration ---
        // Iterate through each character (instruction) in the provided sequence.
        for (let charIndex = 0; charIndex < sequenceLength; charIndex++) {
            const currentInstruction = instructionSequence[charIndex]; // Get the character at the current index.

            // --- Type III Structural Change: Switch Statement for Clarity ---
            // Process the current instruction based on its type.
            switch (currentInstruction) {
                case 'I': // If the instruction is 'I' (Increment)
                    // --- Type III Update: Expanded arithmetic operation ---
                    runningTotal = runningTotal + 1; // Increment the running total.
                    // --- Original Logic: Capture the state after increment ---
                    lastIncrementedSnapshot = runningTotal; // Update the captured snapshot.
                    break; // Exit the switch block.

                case 'D': // If the instruction is 'D' (Decrement)
                    // --- Type III Update: Shorthand arithmetic operation ---
                    runningTotal -= 1; // Decrement the running total.
                    // Note: 'lastIncrementedSnapshot' is NOT updated here, preserving the original logic.
                    break; // Exit the switch block.

                default: // --- Type III Addition: Handle unexpected characters ---
                    // Log a warning for any unrecognized instruction character.
                    // The original Java code would silently ignore such characters.
                    console.warn(`Encountered an unknown instruction character "${currentInstruction}" at position ${charIndex}. This instruction will be skipped.`);
                    // No action taken for unknown characters, maintaining the original implicit behavior.
                    break; // Exit the switch block.
            }
        }

        // --- Type II Renaming & Original Logic ---
        // Return the final captured value, which is the running total's state
        // after the last 'I' instruction, or 0 if no 'I' was found.
        return lastIncrementedSnapshot;
    }
}

// --- Main Execution Block (Analogous to Java's `public static void main`) ---
// This block runs when the script is executed directly.
if (require.main === module) {
    // Create an interface for reading input from the console.
    const consoleInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // --- Type II Renaming & Object Instantiation ---
    const processorInstance = new OperationAccumulator();

    // Prompt the user for an instruction sequence.
    console.log("Please enter an instruction sequence (e.g., IDIIDI):");

    // Read a line of input from the user.
    consoleInterface.on('line', (userInputLine) => {
        // --- Type II Renaming & Method Invocation ---
        // Process the user's input string.
        const finalResult = processorInstance.interpretInstructionSequence(userInputLine);

        // --- Type III Addition: Display the result ---
        // The original Java main method did not print the result of obj.input().
        // For a JavaScript context, printing the result is a common and useful addition.
        console.log(`\nInput Sequence: "${userInputLine}"`);
        console.log(`Processed Result: ${finalResult}`);

        // Close the input interface.
        consoleInterface.close();
    });

    // Handle the close event for the readline interface.
    consoleInterface.on('close', () => {
        console.log("Application finished.");
        process.exit(0); // Exit the Node.js process.
    });
}