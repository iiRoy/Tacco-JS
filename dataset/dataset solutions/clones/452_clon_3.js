/*
 * This script processes sequential blocks of five integer values from standard input.
 * It identifies specific numeric patterns within each block and outputs corresponding numeric codes.
 * Processing terminates when a '0' is encountered as the first value of a potential block.
 * The input is expected to be a series of numbers, separated by whitespace, with '0' signaling the end of meaningful data.
 */

// Define constants for improved readability and maintainability
const CARD_GROUP_SIZE = 5;       // The fixed number of integers in each processing group
const TARGET_DIFFERENCE = 2;     // The specific difference between unique values that triggers a special rule
const FALLBACK_OUTPUT_CODE = 3;  // The default output code for patterns that don't match specific criteria

// Main function responsible for iterating through and analyzing the pre-parsed numeric data
function processNumericCardSets() {
  let currentReadHeadPosition = 0; // Tracks the current index in the global array of parsed numbers
  let processedSetCount = 0;       // Keeps a tally of how many data sets have been successfully processed

  // Loop indefinitely until a termination condition is met internally
  for (;;) {
    // Termination check:
    // 1. If the read head has advanced beyond the available data.
    // 2. If the integer at the current position is zero, indicating end of input.
    if (currentReadHeadPosition >= allInputNumbers.length || parseInt(allInputNumbers[currentReadHeadPosition], 10) === 0) {
      break; // Exit the loop if end of input or terminator '0' is found
    }

    processedSetCount++; // Increment the counter for each new data set
    const activeNumericSet = []; // Array to store the five numbers for the current processing group

    // Extract a complete group of five numbers from the global input array
    for (let idx = 0; idx < CARD_GROUP_SIZE; idx++) {
      // Defensive check: Ensure there's enough data to form a full group
      if (currentReadHeadPosition >= allInputNumbers.length) {
        console.error(`Error: Incomplete numeric set encountered at position ${currentReadHeadPosition}. Stopping.`);
        return; // Abort processing if input is malformed in the middle of a set
      }
      const numericalEntry = parseInt(allInputNumbers[currentReadHeadPosition++], 10);
      activeNumericSet.push(numericalEntry);
    }

    // Determine the unique values within the current set and sort them in ascending order.
    // A Set is used for efficient uniqueness extraction, then converted to an Array for sorting.
    const uniqueSortedValues = Array.from(new Set(activeNumericSet)).sort((valA, valB) => valA - valB);

    // Conditional logic based on the count of unique values
    if (uniqueSortedValues.length === TARGET_DIFFERENCE) { // Case: Exactly two distinct values
      // Further check: Is the difference between these two unique values equal to our target?
      if (uniqueSortedValues[1] - uniqueSortedValues[0] === TARGET_DIFFERENCE) {
        // Special rule: If conditions met, swap the order of the two unique values.
        // This effectively inverts their assigned 'rank' for output.
        let temporaryStorage = uniqueSortedValues[0];
        uniqueSortedValues[0] = uniqueSortedValues[1];
        uniqueSortedValues[1] = temporaryStorage;
      }
      // Output the 1-based index (rank) of each original number within the (potentially swapped) unique values array.
      for (const singleItem of activeNumericSet) {
        const itemRankIndex = uniqueSortedValues.indexOf(singleItem);
        // A check to ensure the item is found, though it should always be given the logic.
        if (itemRankIndex !== -1) {
          console.log(itemRankIndex + 1);
        } else {
          // Fallback, should not typically be reached
          console.log(FALLBACK_OUTPUT_CODE);
        }
      }
    } else {
      // All other cases (e.g., 1, 3, 4, or 5 unique values): output the default code for each item.
      // This loop ensures the correct number of outputs are generated.
      activeNumericSet.forEach(() => {
        console.log(FALLBACK_OUTPUT_CODE);
      });
    }
    // Optional: Add a visual separator or log for clarity between processed sets
    // console.log(`--- Set ${processedSetCount} Processed ---`);
  }
}

// Global variables for managing standard input
let accumulatedRawInput = ''; // Buffer to collect incoming data chunks
let allInputNumbers = [];     // Array to hold all parsed numbers from the input

// Configure standard input stream
process.stdin.resume();              // Keep the Node.js event loop active
process.stdin.setEncoding('utf8');   // Specify UTF-8 encoding for text input

// Event listener: Appends each incoming data chunk to the buffer
process.stdin.on('data', (dataChunk) => {
  accumulatedRawInput += dataChunk;
});

// Event listener: Fired when the entire input stream has ended
process.stdin.on('end', () => {
  // Process the accumulated raw input:
  // 1. Split by any whitespace character (space, tab, newline, etc.)
  // 2. Filter out any resulting empty strings (e.g., from multiple consecutive whitespaces)
  // 3. Convert each non-empty string into an integer.
  allInputNumbers = accumulatedRawInput.split(/\s+/).filter(Boolean).map(str => parseInt(str, 10));

  // Pre-check: Ensure there is valid numeric input to process
  if (allInputNumbers.length === 0) {
    console.error("Error: No valid numeric data was provided in the input stream.");
    return; // Terminate if no data
  }

  // Initiate the main data processing logic
  processNumericCardSets();
});