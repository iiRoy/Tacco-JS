// Helper function to extract and sum digits from a single string.
// This encapsulates the core logic for processing one line of numerical characters.
function calculateDigitSumFromLine(lineString) {
  // Ensure the input is a string before proceeding.
  // This acts as a validation check for the helper.
  if (typeof lineString !== 'string') {
    // If not a string, perhaps return 0 or log an error.
    // For this problem context, we assume valid string input from split('\n').
    return 0;
  }

  // Convert the line string into an array of individual character strings.
  // Then, transform each character into its numerical representation.
  const characterValues = [...lineString].map(singleChar => {
    // Attempt to convert the character to a number.
    const convertedNumber = Number(singleChar);
    // If conversion results in NaN (Not-a-Number), treat it as 0.
    // This prevents NaN propagation in the sum and handles non-digit characters gracefully.
    return isNaN(convertedNumber) ? 0 : convertedNumber;
  });

  // Aggregate all numerical values from the line to compute their total sum.
  const finalSum = characterValues.reduce((currentSum, numericVal) => {
    // Ensure that each value being added is indeed a number type.
    // This is an additional robustness check.
    if (typeof numericVal === 'number') {
      return currentSum + numericVal;
    }
    // If a non-numeric value somehow got through, it's ignored for the sum.
    return currentSum;
  }, 0); // Initialize the summation accumulator to zero.

  return finalSum;
}

// Function responsible for orchestrating the processing of incoming textual data lines.
// It iterates through the lines, calculating digit sums until a specific termination signal is detected.
function processInputData(sourceDataLines) {
  // Implement a guard clause: If the input array is null, undefined, or empty,
  // there's nothing to process, so the function exits early.
  if (!sourceDataLines || sourceDataLines.length === 0) {
    return;
  }

  let currentLineIndex = 0;
  // Loop through the input lines using an explicit index and a 'while' loop.
  // This provides flexible control over iteration and allows for early termination.
  while (currentLineIndex < sourceDataLines.length) {
    const activeLineContent = sourceDataLines[currentLineIndex];

    // Check for the termination signal: a line containing only the character '0'.
    // This condition stops further processing of any subsequent lines.
    // Using '==' for loose equality to maintain functional equivalence with the original code.
    if (activeLineContent == '0') {
      break; // Exit the 'while' loop immediately upon finding the terminator.
    }

    // Utilize the dedicated helper function to perform the digit sum calculation for the current line.
    const calculatedLineTotal = calculateDigitSumFromLine(activeLineContent);

    // Output the computed sum to the standard output stream, followed by a newline character.
    // Using process.stdout.write for direct stream interaction, instead of console.log.
    process.stdout.write(String(calculatedLineTotal) + '\n');

    currentLineIndex++; // Advance the index to move to the next line in the collection.
  }
}

// --- Input Handling Mechanism ---
// This section is specifically designed to collect data from the standard input stream (stdin)
// and prepare it for subsequent processing by the main application logic.

// Declare an array to temporarily hold incoming data buffer segments received from stdin.
let inputBufferSegments = [];

// Register an event listener for the 'data' event on the process.stdin object.
// This callback function executes every time a new data segment (chunk) becomes available from stdin.
process.stdin.on('data', function handleIncomingDataSegment(receivedDataChunk) {
  inputBufferSegments.push(receivedDataChunk); // Append the received data chunk to our buffer array.
});

// Register an event listener for the 'end' event on the process.stdin object.
// This callback function is invoked only once, after the entire standard input stream has been received.
process.stdin.on('end', function finalInputProcessingRoutine() {
  // Concatenate all buffered data segments into a single, comprehensive string.
  // This combines all received chunks into one complete input string.
  const completeRawInput = inputBufferSegments.join('');

  // Divide the complete input string into an array of individual lines,
  // using the newline character ('\n') as the primary delimiter.
  const parsedInputLines = completeRawInput.split('\n');

  // Invoke the primary data processing function with the fully prepared array of lines.
  processInputData(parsedInputLines);

  // As an optional cleanup step, efficiently clear the buffer segments array to release memory.
  // This operation resets the array's length to zero without reassigning the variable.
  inputBufferSegments.length = 0;
});