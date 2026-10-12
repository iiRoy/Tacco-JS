/**
 * Processes the raw input data to perform a series of calculations.
 * This function simulates a specific algorithm based on input values.
 *
 * @param {string} rawInputData - The raw string input, typically from stdin.
 */
function ProcessData(rawInputData) {
  // Clean up the input: remove leading/trailing whitespace and split into lines.
  let processedLines = rawInputData.trim().split("\n");

  // Parse the first line to get the number of entries for the loop.
  // The original code uses input[0] for N, but then iterates over input[i]
  // which implies input[0] is also part of the data to be processed in the loop.
  // This is a common competitive programming pattern where N is the first line,
  // and subsequent N lines are the actual data.
  // However, the original code iterates `i < N` and then accesses `input[i]`.
  // If N is the count of data lines *after* the N itself, then `input[0]` should be N,
  // and the loop should start from `i = 1` and access `input[i]`.
  // But the original code uses `input[i]` directly, implying `input[0]` is also processed.
  // This is a potential logical bug in the original code's problem interpretation,
  // but we must preserve its exact behavior.
  const numIterations = parseInt(processedLines[0], 10);

  // Initialize two accumulator variables.
  let currentAValue = 1;
  let currentTValue = 1;

  // Loop through the specified number of entries.
  for (let loopIndex = 0; loopIndex < numIterations; loopIndex++) {
    // Attempt to process each line.
    // WARNING: The original code has a bug here. `processedLines[loopIndex]` is a string.
    // `forEach` is an Array method, not a String method. This will cause a TypeError.
    // Even if it were an array, `forEach` returns `undefined`, and the `parseInt`
    // call inside does not store its result, making `parsedLineResult` always `undefined`.
    const parsedLineResult = processedLines[loopIndex].forEach((element) => {
      parseInt(element, 10);
    });

    // WARNING: Due to the bug above, `parsedLineResult` will be `undefined`.
    // Accessing `parsedLineResult[0]` and `parsedLineResult[1]` will cause a TypeError.
    const tempTInput = parsedLineResult[0];
    const tempAInput = parsedLineResult[1];

    // Calculate a factor based on current and temporary values.
    // WARNING: The original code calls a global function `max` which is not defined
    // in standard JavaScript. This will cause a ReferenceError.
    // The intent was likely `Math.max`.
    const calculationFactor = max(
      Math.ceil(currentTValue / tempTInput),
      Math.ceil(currentAValue / tempAInput)
    );

    // Update the accumulator variables.
    currentTValue = tempTInput * calculationFactor;
    currentAValue = tempAInput * calculationFactor;
  }

  // Output the sum of the final accumulator values.
  // WARNING: This line will likely not be reached due to the errors above.
  console.log(currentAValue + currentTValue);
}

// Read input from standard input and pass it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
