// This script simulates a simple stack machine that processes commands from standard input.
// It supports 'push', 'pop', and 'quit' operations.

/**
 * Executes a sequence of stack manipulation commands.
 * This function processes each instruction, updating an internal data store.
 *
 * @param {Array<string>} commandSequence - An array of strings, where each string represents a command.
 *                                        Example: ["push itemA", "pop", "quit"]
 * @returns {Promise<void>} A Promise that resolves when all commands have been processed or an error occurs.
 */
async function processCommandStream(commandSequence) {
  // Defensive programming: check if the input command sequence is valid.
  if (!commandSequence || !Array.isArray(commandSequence) || commandSequence.length === 0) {
    console.error("Error: The provided command sequence is empty or not an array. No operations will be performed.");
    return; // Terminate execution early if input is invalid.
  }

  // Initialize the core data structure: a stack for storing elements.
  // Using 'const' as the reference to the array won't change, only its contents.
  const operationStack = [];

  // Control flag to manage the execution loop, allowing for graceful termination.
  let continueProcessing = true;

  // Index to track the current instruction being processed.
  let currentInstructionPointer = 0;

  // A try-catch block to gracefully handle any unexpected errors during command execution.
  try {
    // The main loop iterates through the command sequence as long as processing should continue
    // and there are still instructions left to execute.
    while (continueProcessing && currentInstructionPointer < commandSequence.length) {
      const currentInputLine = commandSequence[currentInstructionPointer];

      // Skip over any empty or whitespace-only lines to prevent parsing errors.
      if (!currentInputLine || currentInputLine.trim() === '') {
        console.warn(`Warning: Skipping empty or whitespace-only instruction at index ${currentInstructionPointer}.`);
        currentInstructionPointer++;
        continue; // Move to the next instruction.
      }

      // Parse the instruction: split the line into parts to identify the command and its argument.
      const instructionParts = currentInputLine.trim().split(/\s+/);
      const primaryDirective = instructionParts[0].toLowerCase(); // Convert to lowercase for case-insensitive matching.
      const directiveArgument = instructionParts.length > 1 ? instructionParts[1] : null; // Extract argument if present.

      // Debugging/logging: Uncomment the following line for verbose output during execution.
      // console.log(`DEBUG: Processing instruction #${currentInstructionPointer}: '${primaryDirective}' with argument '${directiveArgument || "N/A"}'`);

      // Determine the action based on the primary directive.
      if (primaryDirective === 'quit') {
        // The 'quit' command signals the termination of the processing loop.
        console.info("Info: 'quit' directive encountered. Halting further command execution.");
        continueProcessing = false; // Set the flag to exit the loop.
      } else if (primaryDirective === 'push') {
        // The 'push' command adds an item to the top of the stack.
        if (directiveArgument === null) {
          // Validation: Ensure a value is provided for the 'push' operation.
          console.error(`Error: 'push' directive at index ${currentInstructionPointer} is missing its required argument. Operation skipped.`);
        } else {
          const valueToStore = directiveArgument; // Use a descriptive variable name.
          operationStack.push(valueToStore);
          // Optional: Confirmation log for successful push.
          // console.log(`Info: Successfully pushed '${valueToStore}' onto the stack.`);
        }
      } else if (primaryDirective === 'pop') {
        // The 'pop' command removes and retrieves the top item from the stack.
        if (operationStack.length === 0) {
          // Validation: Prevent popping from an empty stack to avoid errors and provide user feedback.
          console.warn(`Warning: 'pop' directive at index ${currentInstructionPointer} attempted on an empty stack. No element to retrieve.`);
        } else {
          const retrievedElement = operationStack.pop(); // Get the top element.
          // Output the retrieved element to standard output, followed by a newline.
          process.stdout.write(`${retrievedElement}\n`);
        }
      } else {
        // Handle any unrecognized commands, providing a warning to the user.
        console.warn(`Warning: Unrecognized directive '${primaryDirective}' at index ${currentInstructionPointer}. This instruction will be ignored.`);
      }

      // Advance the instruction pointer to the next command in the sequence.
      currentInstructionPointer++;
    }
  } catch (runtimeError) {
    // Log any unexpected errors that occur during the command processing.
    console.error(`FATAL ERROR: An unhandled exception occurred during command stream processing: ${runtimeError.message}`, runtimeError.stack);
  } finally {
    // This block always executes, regardless of whether an error occurred or not.
    console.log("Info: Command stream processing has concluded.");
  }
}

// --- Standard Input Handling Logic ---
// This section sets up the asynchronous reading of data from standard input (stdin).

// An immediately invoked async function expression (IIAFE) to manage the asynchronous flow.
(async () => {
  const incomingDataFragments = []; // Array to collect buffer chunks from stdin.

  /**
   * Asynchronously acquires all data from standard input.
   *
   * @returns {Promise<string>} A promise that resolves with the complete input as a single string.
   */
  const captureStandardInput = () => {
    return new Promise((resolve, reject) => {
      // Event listener for incoming data chunks.
      process.stdin.on('data', (dataChunk) => {
        incomingDataFragments.push(dataChunk);
      });

      // Event listener for the end of the input stream.
      process.stdin.on('end', () => {
        // Concatenate all collected data fragments into a single string.
        resolve(Buffer.concat(incomingDataFragments).toString('utf8'));
      });

      // Event listener for errors during input reading.
      process.stdin.on('error', (inputReadError) => {
        console.error("Error: Failed to read from standard input stream.", inputReadError);
        reject(inputReadError); // Reject the promise on error.
      });
    });
  };

  try {
    const rawInputContent = await captureStandardInput(); // Wait for all input to be received.

    // Validate if any content was actually received.
    if (!rawInputContent || rawInputContent.trim() === '') {
      console.warn("Warning: No content was received from standard input. Exiting.");
      return; // Exit if no input is provided.
    }

    // Split the raw input string into individual lines (commands).
    const parsedCommandLines = rawInputContent.split('\n');

    // Filter out any completely empty lines that might result from trailing newlines or
    // multiple consecutive newlines in the input, to avoid processing them as commands.
    const filteredCommandInstructions = parsedCommandLines.filter(line => line.trim() !== '');

    // Invoke the main command processing function with the prepared list of instructions.
    await processCommandStream(filteredCommandInstructions);
  } catch (overallError) {
    // Catch any errors that occur during the input capture or initial processing phase.
    console.error("Critical Error: An issue occurred during input acquisition or initial processing:", overallError);
  }
})();