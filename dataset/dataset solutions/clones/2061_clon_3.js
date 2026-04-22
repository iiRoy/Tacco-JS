// This function orchestrates the processing of a series of numerical transformations.
function processComputationalSeries(rawInputData) {

  // Validate the initial raw input.
  if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim() === '') {
    console.error("Error: Provided input data is empty or invalid. Terminating process.");
    return; // Exit if input is bad
  }

  // Split the raw input into individual lines, handling various newline conventions.
  const processedInputLines = rawInputData.split(/\r?\n/);

  // Iterate through the processed lines, treating each pair of lines as a distinct problem instance.
  // The loop increment is 2 because each problem set consists of a length indicator and a number sequence.
  for (let currentLineCursor = 0; currentLineCursor < processedInputLines.length; currentLineCursor += 2) {

    // Ensure we have both lines for the current problem.
    if (currentLineCursor + 1 >= processedInputLines.length) {
      // This means the last line might be an N without a subsequent sequence, or an empty line.
      // We log a warning and break as we cannot process an incomplete set.
      console.warn("Warning: Incomplete problem set detected at line index " + currentLineCursor + ". Skipping remaining input.");
      break;
    }

    // Extract the initial length of the sequence for the current problem.
    // Use Number() for explicit conversion, and check for validity.
    const initialSequenceLength = Number(processedInputLines[currentLineCursor]);

    if (Number.isNaN(initialSequenceLength) || initialSequenceLength <= 0) {
      console.error(`Error: Invalid sequence length '${processedInputLines[currentLineCursor]}' at line ${currentLineCursor}. Skipping this problem set.`);
      continue; // Skip to the next problem set
    }

    // Retrieve the string representing the sequence of digits.
    const digitString = processedInputLines[currentLineCursor + 1];

    // Convert the digit string into an array of individual numeric values.
    // Use Array.from for a slightly different, more explicit conversion approach.
    const numericSequence = Array.from(digitString, char => Number(char));

    // Basic validation for the numeric sequence's integrity and length.
    if (numericSequence.some(isNaN) || numericSequence.length !== initialSequenceLength) {
        console.error(`Error: Malformed numeric sequence '${digitString}' for an expected length of ${initialSequenceLength} at line ${currentLineCursor + 1}. Skipping this problem set.`);
        continue;
    }

    // The main computational loop, systematically reducing the sequence iteratively.
    // 'outerIterationCounter' decrements from the initial length down to 2, controlling the overall reduction phases.
    for (let outerIterationCounter = initialSequenceLength; outerIterationCounter > 1; outerIterationCounter--) {

      // Inner loop performs a series of transformations based on the current 'outerIterationCounter' value.
      // It simulates a "rotate and replace" operation.
      for (let innerOperationIndex = 0; innerOperationIndex < outerIterationCounter; innerOperationIndex++) {

        // Ensure there are at least two elements to perform the difference operation.
        // This is a crucial safety check to prevent errors with small sequences.
        if (numericSequence.length < 2) {
          console.error("Runtime Error: Sequence unexpectedly ran out of elements during an inner transformation. Halting this problem set.");
          // To prevent infinite loops or further errors, we break out of both loops.
          outerIterationCounter = 0; // Effectively ends outer loop
          break; // Exit inner loop
        }

        // Extract the first two elements for improved readability.
        const firstElement = numericSequence[0];
        const secondElement = numericSequence[1];

        // Calculate the absolute difference between these two elements.
        const computedDifference = Math.abs(firstElement - secondElement);

        // Add the newly computed difference to the end of the sequence.
        numericSequence.push(computedDifference);

        // Remove the first element from the sequence, effectively shifting all elements.
        numericSequence.shift();
      }

      // After each full inner loop cycle, remove the last element from the sequence.
      // This step is critical for the intended reduction process to eventually yield a single element.
      if (numericSequence.length > 0) { // Safety check to prevent popping from an empty array
          numericSequence.pop();
      } else {
          console.warn("Warning: Attempted to pop from an empty sequence. This might indicate an issue with the reduction logic.");
          // If the sequence is empty here, further processing for this set is pointless.
          outerIterationCounter = 0; // Effectively ends outer loop
      }
    }

    // After all transformations, the sequence should ideally contain a single element.
    // Output this final element, explicitly converting it to a string.
    if (numericSequence.length > 0) {
        console.log(numericSequence[0].toString());
    } else {
        // This case should ideally not be hit if the algorithm and input are correct.
        console.error("Error: Final sequence is empty for this problem set. No result to display.");
    }
  }
}

// Helper function to abstract away the file system interaction details.
function retrieveInputFromFile(filePath) {
  try {
    const fileSystemModule = require("fs");
    // Explicitly specify utf8 encoding to ensure correct string interpretation from the file.
    return fileSystemModule.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error(`Failed to read input from file at ${filePath}:`, error.message);
    // In case of error, return an empty string to allow the main function to handle it gracefully.
    return "";
  }
}

// Execution entry point for the application.
// This typically reads from standard input in competitive programming environments.
const inputSourcePath = "/dev/stdin";
const applicationInput = retrieveInputFromFile(inputSourcePath);

// Initiate the sequence computation process with the retrieved input data.
processComputationalSeries(applicationInput);