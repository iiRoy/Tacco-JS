/**
 *    This routine processes a given text input.
 *    It analyzes patterns within a character sequence
 *    and determines maximum sums based on specific window calculations.
 */
function ProcessData(rawData) {
  "use strict"; /* Enforce strict mode for cleaner code */

  // Split the entire input string into individual rows using newline characters
  const textRows = rawData.split("\n");

  // The first row contains two crucial numerical parameters
  const firstRowParts = textRows[0].split(" ");
  const totalElements = parseInt(firstRowParts[0], 10); // Parse the first number as an integer
  const maxFlips = parseInt(firstRowParts[1], 10);     // Parse the second number as an integer

  // The second row contains the sequence of characters to be analyzed
  const charSequence = textRows[1].split("");

  // Determine the overall length of the character sequence
  const sequenceLength = charSequence.length;

  // Initialize arrays to store lengths of consecutive blocks of identical characters
  const blockLengths = [];
  const zeroBlocks = []; // Stores lengths of '0' blocks
  const oneBlocks = [];  // Stores lengths of '1' blocks

  let currentBlockSize = 1;         // Tracks the size of the current contiguous block
  let previousChar = charSequence[0]; // Stores the character from the previous iteration

  // Iterate through the character sequence starting from the second character
  for (let idx = 1; idx < sequenceLength; ++idx) {
    const currentChar = charSequence[idx]; // Get the current character

    // Check if the current character is different from the previous one
    if (currentChar !== previousChar) {
      // If different, the current block has ended. Record its size.
      blockLengths.push(currentBlockSize);

      // Categorize the block based on the character that formed it
      if (currentChar === "1") {
        oneBlocks.push(currentBlockSize);
      } else {
        zeroBlocks.push(currentBlockSize);
      }

      // Reset the current block size for the new block
      currentBlockSize = 1;
    } else {
      // If characters are the same, increment the current block size
      currentBlockSize++;
    }
    // Update the previous character for the next iteration
    previousChar = currentChar;
  }
  // After the loop, the last block's size needs to be pushed
  blockLengths.push(currentBlockSize);
  if (previousChar === "1") {
    oneBlocks.push(currentBlockSize);
  } else {
    zeroBlocks.push(currentBlockSize);
  }


  // If the number of '0' blocks is less than or equal to allowed changes,
  // it means we can effectively change all '0's to '1's.
  // In this scenario, the entire sequence can become '1's, so output the total length.
  if (maxFlips >= zeroBlocks.length) {
    console.log(totalElements);
    return;
  }

  // Determine the initial window size for calculation
  let windowSize;
  if (charSequence[0] === "1") {
    windowSize = maxFlips * 2 + 1; // If sequence starts with '1', window covers specific block types
  } else {
    windowSize = maxFlips * 2 + 2; // If sequence starts with '0', window covers more block types
  }

  // Define a helper function to sum elements in an array
  const calculateTotal = (collection) => collection.reduce((accumulator, element) => accumulator + element, 0);

  // Create the initial sliding window from the block lengths
  const activeSpan = blockLengths.slice(0, windowSize);

  // Initialize an array to store the sum of elements within each sliding window
  const aggregateValues = [calculateTotal(activeSpan)];

  const totalBlockCount = blockLengths.length;

  // Slide the window across the block lengths array
  for (let idx = windowSize; idx < totalBlockCount; ++idx) {
    activeSpan.shift();                      // Remove the oldest element from the window
    activeSpan.push(blockLengths[idx]);      // Add the new element to the window
    aggregateValues.push(calculateTotal(activeSpan)); // Calculate and store the sum of the new window
  }

  // Find the maximum sum among all calculated window sums
  console.log(
    aggregateValues.reduce((accumulator, currentVal) => (accumulator > currentVal ? accumulator : currentVal), 0)
  );
}

// Read input from standard input and pass it to the processing function
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));