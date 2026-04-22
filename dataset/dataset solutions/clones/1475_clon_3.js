// This JavaScript program is a Type III clone designed to manage multiple stack-like data structures.
// It reads commands from standard input to perform operations such as pushing, popping,
// and moving elements between these stacks. Extensive modifications have been made
// to variable names, control flow, and error handling compared to the original,
// while preserving the core functional behavior.

// Import the Node.js file system module to facilitate input reading.
const fileSystemModule = require('fs');

// Acquire all input content from the standard input stream, assuming UTF-8 encoding.
// The variable name is verbose to signify its raw, unprocessed nature.
const rawProgramInput = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Divide the raw input string into an array of individual command lines.
// A regular expression is used for splitting to robustly handle various line ending conventions.
let commandSequence = rawProgramInput.split(/\r?\n/);

// Extract the first line of input, which specifies the total number of stack containers
// that need to be initialized. Explicitly parse it into an integer.
const totalStackContainers = parseInt(commandSequence.shift(), 10);

// Declare an array to serve as the master collection for all our individual stack containers.
// Each element within this array will itself be a JavaScript array, acting as a stack.
let stackCollection = [];

// Initialize each stack container within the master collection as an empty array.
// The loop variable `containerIterator` provides a clear semantic meaning.
for (let containerIterator = 0; containerIterator < totalStackContainers; containerIterator++) {
    stackCollection.push([]); // Add an empty array, representing an empty stack.
}

// A simple counter to monitor the number of valid operations processed.
let operationsProcessed = 0;

// Begin processing commands from the input sequence until a termination signal is received.
// The `while (true)` loop with an explicit `break` condition offers clearer control flow.
while (true) {
    // Retrieve the next command line from the sequence.
    const currentCommandLine = commandSequence.shift();

    // Check for termination conditions: either no more input lines or the explicit 'quit' command.
    if (currentCommandLine === undefined || currentCommandLine === 'quit') {
        // Optional: Log a message indicating the completion and total operations.
        // console.error(`Program terminated after processing ${operationsProcessed} commands.`);
        break; // Exit the command processing loop.
    }

    // Split the current command line into its constituent parts (command type and arguments).
    const commandTokens = currentCommandLine.split(' ');
    const primaryOperationType = commandTokens[0]; // The first token defines the operation.

    // Increment the counter for every command successfully retrieved.
    operationsProcessed++;

    // Utilize a `switch` statement for dispatching operations, which is often
    // more readable than a long `if-else if` chain for multiple distinct cases.
    switch (primaryOperationType) {
        case 'pop': // Original 'pop' command.
        case 'extract': // An alternative alias for the 'pop' operation.
            {
                // Parse the target stack index, adjusting from 1-based (input) to 0-based (array).
                const targetStackIndex = parseInt(commandTokens[1], 10) - 1;

                // Implement a guard clause to validate the stack index.
                if (targetStackIndex < 0 || targetStackIndex >= totalStackContainers) {
                    // console.warn(`Invalid stack index (${commandTokens[1]}) for pop operation. Skipping.`);
                    continue; // Skip processing this invalid command.
                }

                // Attempt to pop an element. If the stack is empty, `.pop()` returns `undefined`.
                const retrievedValue = stackCollection[targetStackIndex].pop();

                // Output the retrieved element to standard output.
                // Convert `undefined` to its string representation if the stack was empty,
                // matching the original behavior.
                process.stdout.write(String(retrievedValue) + '\n');
            }
            break; // End of 'pop'/'extract' case.

        case 'push': // Original 'push' command.
        case 'deposit': // An alternative alias for the 'push' operation.
            {
                const targetStackIndex = parseInt(commandTokens[1], 10) - 1;
                const valueToDeposit = commandTokens[2]; // The third token is the value to push.

                // Validate the target stack index.
                if (targetStackIndex < 0 || targetStackIndex >= totalStackContainers) {
                    // console.warn(`Invalid stack index (${commandTokens[1]}) for push operation. Skipping.`);
                    continue; // Skip this invalid command.
                }

                // Add the specified value to the top of the target stack.
                stackCollection[targetStackIndex].push(valueToDeposit);
            }
            break; // End of 'push'/'deposit' case.

        // The original code's `else` branch implicitly handled a 'move' operation.
        // Here, it's explicitly defined with a case and broken into distinct steps.
        case 'move':
        case 'transfer': // An alternative alias for the 'move' operation.
            {
                const sourceStackIndex = parseInt(commandTokens[1], 10) - 1;
                const destinationStackIndex = parseInt(commandTokens[2], 10) - 1;

                // Implement comprehensive validation for both source and destination indices.
                if (sourceStackIndex < 0 || sourceStackIndex >= totalStackContainers ||
                    destinationStackIndex < 0 || destinationStackIndex >= totalStackContainers) {
                    // console.warn(`Invalid source (${commandTokens[1]}) or destination (${commandTokens[2]}) stack index for move operation. Skipping.`);
                    continue; // Skip this invalid command.
                }

                // Step 1: Pop the element from the source stack.
                // If the source stack is empty, `undefined` will be popped.
                const itemRelocated = stackCollection[sourceStackIndex].pop();

                // Step 2: Push the (potentially undefined) element onto the destination stack.
                stackCollection[destinationStackIndex].push(itemRelocated);
            }
            break; // End of 'move'/'transfer' case.

        default:
            // This `default` case acts as a guard for any unrecognized commands.
            // Such commands are simply ignored to maintain program flow.
            // console.warn(`Unrecognized command encountered: "${primaryOperationType}". Line: "${currentCommandLine}".`);
            break; // Do nothing for unknown commands.
    }
}

// The program concludes once the command processing loop is exited.