initializeAndExecute();

/**
 * Initializes the program by setting up input/output streams,
 * collecting input lines, and then delegating to the core logic
 * for rectangle area calculation.
 * This function now uses an asynchronous approach to handle input.
 */
async function initializeAndExecute() {
  const ioManager = require('readline');

  // Perform a basic check for I/O stream availability.
  if (!process.stdin || !process.stdout) {
    console.error("CRITICAL ERROR: Standard input/output streams are not accessible.");
    process.exit(1); // Terminate with an error code
  }

  const inputHandler = ioManager.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const collectedInputData = [];

  // Wrap the asynchronous input collection in a Promise for better control.
  const inputProcessingPromise = new Promise((resolve, reject) => {
    inputHandler.on('line', (currentTextLine) => {
      // Store each received line after trimming leading/trailing whitespace.
      collectedInputData.push(currentTextLine.trim());
    });

    inputHandler.on('close', () => {
      resolve(); // Indicate that all input has been received.
    });

    inputHandler.on('error', (err) => {
        console.error(`Input stream error: ${err.message}`);
        reject(err); // Reject the promise on an error
    });
  });

  try {
    // Wait until all input lines are gathered.
    await inputProcessingPromise;

    // Validate the minimum expected number of input lines.
    if (collectedInputData.length < 2) {
      console.error("ERROR: Insufficient input provided. Expected at least two lines of data.");
      return; // Exit function if input is not as expected.
    }

    // Process the first line, which is expected to be a total count.
    const specifiedItemCount = parseInt(collectedInputData[0], 10);
    // Even if not directly used in the area calculation, validate its presence.
    if (isNaN(specifiedItemCount) || specifiedItemCount <= 0) {
        console.error("ERROR: Invalid or non-positive item count found in the first input line.");
        return;
    }

    // Process the second line, containing space-separated stick lengths.
    const rawStickLengthStrings = collectedInputData[1].split(' ');

    // Invoke the primary logic to compute the maximum rectangle area.
    const finalCalculatedArea = computeMaxRectangleArea(rawStickLengthStrings);

    // Output the result to standard output.
    process.stdout.write(String(finalCalculatedArea) + '\n');

  } catch (operationError) {
    console.error(`An unexpected error occurred during input processing: ${operationError.message}`);
    process.exit(1);
  } finally {
    // Ensure the input handler is properly closed, though 'close' event usually implies this.
    // If input was a file, this would be more critical.
    if (!inputHandler.closed) {
        inputHandler.close();
    }
  }
}

/**
 * Determines the largest possible area of a rectangle constructible
 * from a given collection of stick lengths. This function prioritizes
 * finding two pairs of the largest available lengths.
 *
 * @param {string[]} lengthValueTexts - An array where each string represents a stick's length.
 * @returns {number} The maximum area of a rectangle. Returns 0 if no rectangle can be formed.
 */
function computeMaxRectangleArea(lengthValueTexts) {
  // Initial check for valid input array. A rectangle requires at least two pairs (4 sticks).
  if (!Array.isArray(lengthValueTexts) || lengthValueTexts.length < 2) {
    return 0;
  }

  const parsedNumericLengths = [];
  // Convert string lengths to numbers and filter out invalid/zero/negative values.
  for (const singleLengthText of lengthValueTexts) {
    const numericalValue = parseInt(singleLengthText, 10);
    if (!isNaN(numericalValue) && numericalValue > 0) {
      parsedNumericLengths.push(numericalValue);
    }
  }

  // If there aren't enough valid sticks after parsing.
  if (parsedNumericLengths.length < 2) {
    return 0;
  }

  // Create a frequency map to count occurrences of each stick length.
  // This allows efficient identification of pairs.
  const lengthOccurrences = new Map();
  for (const currentLength of parsedNumericLengths) {
    lengthOccurrences.set(currentLength, (lengthOccurrences.get(currentLength) || 0) + 1);
  }

  const potentialSideLengths = [];

  // Iterate through the frequency map to find lengths that can form sides.
  // A side requires at least two sticks of the same length.
  // If a length occurs 4 or more times, it can provide two sides (e.g., for a square).
  for (const [lengthMeasurement, count] of lengthOccurrences.entries()) {
    if (count >= 2) {
      potentialSideLengths.push(lengthMeasurement); // First pair
      if (count >= 4) {
        // If a length can form two pairs (e.g., for a square or two identical rectangles),
        // add it again to ensure it's considered for both side dimensions if it's optimal.
        potentialSideLengths.push(lengthMeasurement);
      }
    }
  }

  // If fewer than two distinct side candidates are available, a rectangle cannot be formed.
  // Example: only sticks [5, 5, 3, 2] -> only one pair of 5s.
  if (potentialSideLengths.length < 2) {
    return 0;
  }

  // Sort the identified potential side lengths in descending order.
  // This ensures we pick the largest possible dimensions for maximum area.
  potentialSideLengths.sort((valA, valB) => valB - valA);

  // The first two elements in the sorted array represent the largest two sides
  // that can be formed from the available sticks.
  const primarySideDimension = potentialSideLengths[0];
  const secondarySideDimension = potentialSideLengths[1];

  // A final check to ensure both dimensions are valid before multiplication.
  // This guards against unexpected scenarios, though earlier checks should prevent it.
  if (!primarySideDimension || !secondarySideDimension || primarySideDimension <= 0 || secondarySideDimension <= 0) {
      return 0;
  }

  // Calculate and return the area.
  return primarySideDimension * secondarySideDimension;
}