(function(sourceContent) {
    // This self-executing module processes a series of commands to manipulate named stacks.
    // The input is expected to be a multi-line string, where each line defines a single operation.

    /**
     * Parses the raw input text into an array of command lines.
     * Each command line is itself an array of strings (command and its arguments).
     * @param {string} rawText The complete input string.
     * @returns {string[][]} An array of parsed command lines.
     */
    const parseInputCommands = (rawText) => {
        // Basic validation for the input string.
        if (typeof rawText !== 'string' || rawText.trim().length === 0) {
            console.error("Error: Provided input content is either empty or not a valid string.");
            return [];
        }
        // Split by newline, trim each line, and then split each line by space.
        return rawText.split("\n")
                   .map(line => line.trim())
                   .filter(line => line.length > 0) // Remove entirely empty lines
                   .map(line => line.split(" "));
    };

    // The collection of all commands to be executed, parsed from the input.
    const instructionSet = parseInputCommands(sourceContent);

    // A central registry for all active stacks.
    // Using a Map allows for flexible string keys and efficient lookups,
    // also preventing potential prototype pollution issues with plain objects.
    const stackRegistry = new Map();

    /**
     * Ensures that a stack with the given key exists in the registry.
     * If not, a new empty array is created and associated with the key.
     * @param {string} stackIdentifier The unique key for the stack.
     * @returns {Array<string>} The stack array associated with the identifier.
     */
    const getOrCreateStack = (stackIdentifier) => {
        if (!stackRegistry.has(stackIdentifier)) {
            stackRegistry.set(stackIdentifier, []);
        }
        return stackRegistry.get(stackIdentifier);
    };

    /**
     * Retrieves an existing stack from the registry.
     * @param {string} stackIdentifier The unique key for the stack.
     * @returns {Array<string> | null} The stack array if found, otherwise null.
     */
    const retrieveStack = (stackIdentifier) => {
        return stackRegistry.get(stackIdentifier) || null;
    };

    // Pointer to the current command being processed in the instructionSet.
    // The original code started `index` at 0, then immediately did `index++` before the loop,
    // effectively skipping the first line. We replicate this behavior by starting `commandPointer` at 1.
    let commandPointer = 1;

    // Main execution loop: processes commands sequentially until 'quit' is encountered
    // or all instructions have been processed.
    while (commandPointer < instructionSet.length) {
        const currentOperationArgs = instructionSet[commandPointer];

        // Skip any lines that are empty or malformed after initial parsing.
        if (!currentOperationArgs || currentOperationArgs.length === 0 || currentOperationArgs[0].trim() === '') {
            commandPointer++;
            continue;
        }

        const primaryCommand = currentOperationArgs[0].toLowerCase(); // Normalize command name for robustness
        const firstOperand = currentOperationArgs[1];
        const secondOperand = currentOperationArgs[2];

        // Check for the program termination command first.
        if (primaryCommand === "quit") {
            // console.log("Info: 'quit' command received. Terminating program execution.");
            break;
        }

        // Dispatch commands based on their type.
        switch (primaryCommand) {
            case "push": {
                // Syntax: PUSH stack_name value
                if (firstOperand === undefined || secondOperand === undefined) {
                    console.warn(`Warning: Incomplete 'push' command at line ${commandPointer}. Expected 'push STACK_KEY VALUE'. Skipping.`);
                    break;
                }
                const targetStack = getOrCreateStack(firstOperand);
                targetStack.push(secondOperand);
                // console.log(`Debug: Pushed '${secondOperand}' to stack '${firstOperand}'.`);
                break;
            }

            case "pop": {
                // Syntax: POP stack_name
                if (firstOperand === undefined) {
                    console.warn(`Warning: Incomplete 'pop' command at line ${commandPointer}. Expected 'pop STACK_KEY'. Skipping.`);
                    break;
                }
                const sourceStack = retrieveStack(firstOperand);

                // Guard clause: check if stack exists and is not empty before popping.
                if (!sourceStack || sourceStack.length === 0) {
                    // The original code would print 'undefined' if popping from an empty stack.
                    // This version provides more context in the error message for Type III change.
                    console.error(`Error: Cannot perform pop operation on empty or non-existent stack '${firstOperand}' at line ${commandPointer}.`);
                    // To strictly mimic original output behavior for empty pop, one might print "undefined".
                    // For Type III, we'll output a more descriptive message to distinguish from actual undefined values.
                    console.log(`(Stack '${firstOperand}' was empty)`);
                } else {
                    const extractedElement = sourceStack.pop();
                    console.log(extractedElement);
                    // console.log(`Debug: Popped '${extractedElement}' from stack '${firstOperand}'.`);
                }
                break;
            }

            case "move": {
                // Syntax: MOVE source_stack_name destination_stack_name
                if (firstOperand === undefined || secondOperand === undefined) {
                    console.warn(`Warning: Incomplete 'move' command at line ${commandPointer}. Expected 'move SOURCE_KEY DEST_KEY'. Skipping.`);
                    break;
                }
                const sourceStackKey = firstOperand;
                const destinationStackKey = secondOperand;

                const sourceStack = retrieveStack(sourceStackKey);

                // Guard clause: ensure source stack exists and has items to move.
                if (!sourceStack || sourceStack.length === 0) {
                    console.error(`Error: Failed to move. Source stack '${sourceStackKey}' is empty or not found at line ${commandPointer}.`);
                    break; // Abort move operation if source is invalid.
                }

                const itemToBeTransferred = sourceStack.pop();
                const destinationStack = getOrCreateStack(destinationStackKey); // Ensure destination stack exists.
                destinationStack.push(itemToBeTransferred);
                // console.log(`Debug: Moved '${itemToBeTransferred}' from '${sourceStackKey}' to '${destinationStackKey}'.`);
                break;
            }

            default: {
                // Log a warning for any unrecognized commands.
                console.warn(`Warning: Unrecognized command '${primaryCommand}' encountered at line ${commandPointer}. Skipping this instruction.`);
                break;
            }
        }
        // Advance the instruction pointer to the next command.
        commandPointer++;
    }

    // Optional: Output the final state of all stacks for verification or debugging.
    /*
    console.log("\n--- Final State of Stacks ---");
    if (stackRegistry.size === 0) {
        console.log("No stacks were created or modified during execution.");
    } else {
        stackRegistry.forEach((stackContent, stackKey) => {
            console.log(`Stack '${stackKey}': [${stackContent.join(', ')}]`);
        });
    }
    */

})(require("fs").readFileSync("/dev/stdin", "utf8"));