// Function responsible for processing each distinct set of input parameters to compute combinations.
function calculateCombinations(inputRows) {
  let currentRowIndex = 0; // Tracker for the current line being processed from the input array.

  // Initiate an infinite loop to process input lines until an explicit break condition.
  for (;;) {
    // Fetch the current line from the collection of input rows.
    const currentLineContent = inputRows[currentRowIndex];

    // Check for termination conditions:
    // 1. If the line is undefined or null (end of array).
    // 2. If the trimmed line content matches the specific termination string '0 0'.
    if (!currentLineContent || currentLineContent.trim() === '0 0') {
      break; // Exit the main processing loop as the termination signal is received.
    }

    // Split the line into individual number strings, handling multiple spaces and filtering out empty entries.
    const numberTokens = currentLineContent.trim().split(/\s+/).filter(Boolean);

    // Implement a basic validation for the expected input format.
    if (numberTokens.length !== 2) {
      console.error("Input format error: Expected two numbers per line. Skipping line:", currentLineContent);
      currentRowIndex++; // Advance to the next line despite the error.
      continue; // Skip further processing for this malformed line.
    }

    // Convert the string tokens into numerical values. Using Number() for explicit type conversion.
    const maximumValue = Number(numberTokens[0]); // Corresponds to 'n' in the original problem.
    const desiredTargetSum = Number(numberTokens[1]); // Corresponds to 'x' in the original problem.

    // Validate the parsed numerical inputs for correctness.
    if (isNaN(maximumValue) || isNaN(desiredTargetSum) || maximumValue < 0 || desiredTargetSum < 0) {
      console.error("Data validation error: Invalid numerical values detected. Skipping line:", currentLineContent);
      currentRowIndex++; // Advance to the next line.
      continue; // Skip processing for invalid numbers.
    }

    let validTripleCount = 0; // Initialize a counter for valid combinations of three distinct integers.

    // Outer loop for the first number (firstCandidate).
    // It iterates from 1 up to 'maximumValue'.
    // Optimization: If the smallest possible sum (firstCandidate + (firstCandidate+1) + (firstCandidate+2))
    // already exceeds the 'desiredTargetSum', then no valid triplets can be formed with this or larger 'firstCandidate' values.
    for (let firstCandidate = 1; firstCandidate <= maximumValue; firstCandidate++) {
      if (firstCandidate + (firstCandidate + 1) + (firstCandidate + 2) > desiredTargetSum) {
        break; // Early exit from the outer loop.
      }

      // Inner loop for the second number (secondCandidate).
      // It starts from 'firstCandidate + 1' to ensure distinct and ordered numbers.
      // Optimization: If the smallest possible sum (firstCandidate + secondCandidate + (secondCandidate+1))
      // already exceeds the 'desiredTargetSum', then no valid triplets can be formed with this or larger 'secondCandidate' values.
      for (let secondCandidate = firstCandidate + 1; secondCandidate <= maximumValue; secondCandidate++) {
        if (firstCandidate + secondCandidate + (secondCandidate + 1) > desiredTargetSum) {
          break; // Early exit from the inner loop.
        }

        // Calculate the required value for the third number (thirdCandidate) to meet the 'desiredTargetSum'.
        const thirdCandidate = desiredTargetSum - firstCandidate - secondCandidate;

        // Check if 'thirdCandidate' satisfies the necessary conditions:
        // 1. It must be strictly greater than 'secondCandidate' (for distinct and ordered triplets).
        // 2. It must not exceed the 'maximumValue'.
        if (thirdCandidate > secondCandidate && thirdCandidate <= maximumValue) {
          validTripleCount++; // Increment the counter if all conditions are met.
        }
      }
    }

    // Output the total count of valid triplets found for the current input set.
    console.log(validTripleCount);

    // Prepare for processing the next line of input.
    currentRowIndex++;
  }
}

// A temporary buffer to accumulate data chunks received from standard input.
const collectedInputBufferParts = [];

// Attach an event listener for the 'readable' event on standard input.
// This event fires when there is data to be read from the stream.
process.stdin.on('readable', () => {
  let dataSegment;
  // Continuously read data until the buffer is exhausted.
  while ((dataSegment = process.stdin.read()) !== null) {
    collectedInputBufferParts.push(dataSegment); // Store each incoming data segment (Buffer object).
  }
});

// Attach an event listener for the 'end' event on standard input.
// This event signifies that no more data will be provided.
process.stdin.on('end', () => {
  // Concatenate all buffered data segments into a single Buffer, then convert it to a UTF-8 string.
  const completeInputString = Buffer.concat(collectedInputBufferParts).toString('utf8');
  // Split the complete string into an array of individual lines, using the newline character as a delimiter.
  const processedInputLines = completeInputString.split('\n');
  // Invoke the main processing function with the array of lines.
  calculateCombinations(processedInputLines);
});