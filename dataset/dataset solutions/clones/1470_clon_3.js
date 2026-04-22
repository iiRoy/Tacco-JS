(function(rawInputContent) {
    /**
     * This module simulates a basic stack-based command processor.
     * It reads commands from an input string, parses them, and executes
     * 'push' and 'pop' operations on an internal stack data structure.
     * The processing continues until a 'quit' command is encountered.
     * It includes additional validations and logging for robustness.
     */

    // --- Configuration Constants ---

    // Delimiter used to split the entire input string into individual command lines.
    const LINE_COMMAND_DELIMITER = "\n";
    // Delimiter used to split a command line into its verb and arguments.
    const COMMAND_ARG_DELIMITER = " ";

    // --- Core Data Structures ---

    // Holds the raw input content split into individual lines.
    // Each element is a string like "push 10" or "pop".
    const sourceCommandLines = rawInputContent.split(LINE_COMMAND_DELIMITER);

    // Stores the parsed commands, where each command is an array of strings.
    // Example: [ ["push", "10"], ["pop"], ["quit"] ]
    const structuredInstructions = [];

    // The primary stack data structure where values are pushed and popped.
    const operationValueStack = [];

    // --- Processor State Variables ---

    // A pointer indicating the current instruction being executed from 'structuredInstructions'.
    let currentExecutionPointer = 0;

    // Counter for the total number of commands processed (excluding parsing).
    let processedCommandCount = 0;

    // --- Input Parsing Phase ---

    // Iterate through each raw line from the input source.
    // Parse each line into its command verb and arguments.
    for (let lineIdx = 0; lineIdx < sourceCommandLines.length; lineIdx++) {
        const currentLineText = sourceCommandLines[lineIdx];

        // Skip any lines that are empty or contain only whitespace.
        if (currentLineText.trim() === "") {
            // Optional: console.debug(`Skipped empty line at input index ${lineIdx}.`);
            continue;
        }

        // Split the current line by the argument delimiter to separate command verb from args.
        const commandParts = currentLineText.split(COMMAND_ARG_DELIMITER);
        // Add the parsed command array to our list of structured instructions.
        structuredInstructions.push(commandParts);
    }

    // --- Command Execution Phase ---

    console.log("--- Initializing Stack Command Processor ---");

    // Begin processing commands. The loop continues indefinitely until a 'quit' command
    // is explicitly encountered or there are no more instructions to process.
    while (true) {
        // Guard clause: Check if we have exhausted all available instructions.
        if (currentExecutionPointer >= structuredInstructions.length) {
            console.warn("Processor reached end of instructions without encountering a 'quit' command.");
            break; // Exit the execution loop.
        }

        // Fetch the current command array (e.g., ["push", "10"]).
        const currentInstruction = structuredInstructions[currentExecutionPointer];
        // Extract the command verb (e.g., "push", "pop", "quit").
        const commandVerb = currentInstruction[0];

        // Increment the total count of commands processed.
        processedCommandCount++;

        // Process the command based on its verb, making it case-insensitive.
        switch (commandVerb.toLowerCase()) {
            case "push":
                // Validate that a value to push is provided.
                if (currentInstruction.length < 2) {
                    console.error(`ERROR: 'push' command at instruction ${currentExecutionPointer} requires a value. Skipping.`);
                    // Continue to the next instruction without pushing.
                    break;
                }
                const valueForPush = currentInstruction[1];
                operationValueStack.push(valueForPush);
                // Optional: console.debug(`DEBUG: Pushed '${valueForPush}'. Current stack size: ${operationValueStack.length}`);
                break;

            case "pop":
                // Validate that the stack is not empty before attempting to pop.
                if (operationValueStack.length === 0) {
                    console.log("(Stack is currently empty, cannot perform pop operation)");
                } else {
                    const retrievedElement = operationValueStack.pop();
                    // Output the popped element as per the original specification.
                    console.log(retrievedElement);
                    // Optional: console.debug(`DEBUG: Popped '${retrievedElement}'. Remaining stack size: ${operationValueStack.length}`);
                }
                break;

            case "quit":
                console.log("--- 'quit' command detected. Terminating processor execution. ---");
                // The 'break' statement here will exit the switch, and the subsequent
                // 'if' condition will handle breaking out of the 'while' loop.
                break;

            default:
                // Handle any unrecognized or unsupported command verbs.
                console.warn(`WARNING: Unknown command verb '${commandVerb}' at instruction ${currentExecutionPointer}. Skipping.`);
                break;
        }

        // If the command processed was 'quit', we should now terminate the main processing loop.
        if (commandVerb.toLowerCase() === "quit") {
            break; // Exit the 'while (true)' loop.
        }

        // Move to the next instruction in the sequence for the next iteration.
        currentExecutionPointer++;
    }

    // --- Post-Execution Summary ---

    console.log(`\n--- Processor Execution Summary ---`);
    // Adjust the count to not include the 'quit' command itself in the total operations.
    const actualOperations = (commandVerb && commandVerb.toLowerCase() === "quit") ? processedCommandCount - 1 : processedCommandCount;
    console.log(`Total commands processed: ${actualOperations}`);

    // If there are any items left on the stack, report them.
    if (operationValueStack.length > 0) {
        console.log(`Remaining items on stack: [${operationValueStack.join(', ')}]`);
    } else {
        console.log("Stack is empty after all operations.");
    }
    console.log("--- Processor Shut Down ---");

})(
    // The input source function remains consistent with the original.
    // It reads the entire content of stdin as a UTF-8 string.
    require("fs").readFileSync("/dev/stdin", "utf8")
);