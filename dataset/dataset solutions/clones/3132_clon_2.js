"use strict";

/**
 * Flips a specific bit within a numerical value.
 * This operation is achieved by performing a bitwise XOR with a mask
 * where only the target bit is set.
 *
 * @param {number} valueParam The integer whose bit is to be modified.
 * @param {number} bitIndex The zero-based position of the bit to toggle.
 * @returns {number} The resulting integer after the bit flip.
 */
function toggleBit(valueParam, bitIndex) {
  // The expression (0x1 << bitIndex) creates a mask with only the bitIndex-th bit set.
  // XORing with this mask effectively flips the bit at that position.
  return valueParam ^ (0x1 << bitIndex);
}

/**
 * Recursively constructs a Gray code sequence and appends it to a provided array.
 * The function generates a sequence of numbers where successive elements differ by only one bit.
 *
 * @param {Array<number>} sequenceArray The array to which the generated Gray code numbers will be added.
 * @param {number} currentBitPosition The current bit position (or 'level' of recursion) being processed.
 *                                     This determines the range of numbers in the Gray code.
 */
function generateGraySequence(sequenceArray, currentBitPosition) {
  // Base case for recursion: If the current bit position is greater than zero,
  // we continue to build the sequence.
  if (currentBitPosition > 0x0) {
    // First, recursively generate the Gray code for the next lower bit position.
    generateGraySequence(sequenceArray, currentBitPosition - 0x1);
    // Then, take the last element generated, toggle its 'currentBitPosition' bit,
    // and add this new number to the sequence.
    sequenceArray.push(toggleBit(sequenceArray[sequenceArray.length - 0x1], currentBitPosition));
    // Finally, recursively generate the Gray code for the next lower bit position again.
    // This mirrors the sequence to complete the Gray code pattern.
    generateGraySequence(sequenceArray, currentBitPosition - 0x1);
    return; // Terminate this recursive call.
  }
  // Another base case: If the current bit position is exactly zero,
  // we simply toggle the least significant bit (0th bit) of the last element
  // and add it to the sequence. This is the fundamental step for 1-bit Gray code.
  if (currentBitPosition === 0x0) {
    sequenceArray.push(sequenceArray[sequenceArray.length - 0x1] ^ 0x1);
  }
  return; // Terminate this recursive call.
}

/**
 * Generates a specific sequence of numbers that represents a path
 * from an all-zero state to an all-one state by inverting bits.
 * This path is constructed using a modified Gray code approach.
 *
 * @param {Array<number>} pathArray The array where the generated path elements will be stored.
 * @param {number} maxBitPower The maximum power of 2 (m) relevant to the bit inversion process,
 *                              implying a total of (2*m + 1) bits are considered.
 */
function createInvertedGrayPath(pathArray, maxBitPower) {
  // Initialize a temporary array to hold a standard Gray code sequence, starting with zero.
  let tempGraySequence = [0x0];
  // Generate a Gray code sequence for a total of (2 * maxBitPower) bits.
  generateGraySequence(tempGraySequence, 0x2 * maxBitPower);
  // Remove the initial zero from the temporary Gray code sequence as it's not needed for the path construction.
  tempGraySequence.shift();

  // Iterate through bit positions from 0 up to (2 * maxBitPower - 1).
  for (let idxA = 0x0; idxA < 0x2 * maxBitPower; idxA++) {
    // Filter the temporary Gray sequence: keep only those numbers where the 'idxA'-th bit is 0.
    tempGraySequence = tempGraySequence.filter(elementValue => (elementValue >> idxA) % 0x2 === 0x0);
    // Get the last number currently in the main pathArray.
    let lastElement = pathArray[pathArray.length - 0x1];
    // For each filtered number in tempGraySequence, XOR it with 'lastElement' and add to pathArray.
    for (let idxB = 0x0; idxB < tempGraySequence.length; idxB++) {
      pathArray.push(lastElement ^ tempGraySequence[idxB]);
    }
    // After processing the filtered sequence, toggle the 'idxA'-th bit of the very last element
    // added to pathArray and append this new value.
    pathArray.push(pathArray[pathArray.length - 0x1] ^ (0x1 << idxA));
  }
  // Finally, toggle the (2 * maxBitPower)-th bit of the last element in pathArray and append it.
  pathArray.push(pathArray[pathArray.length - 0x1] ^ (0x1 << (0x2 * maxBitPower)));
}

/**
 * The primary function that orchestrates the generation of a bit-flipping path
 * between two given numbers, A and B, based on their bit differences.
 * It reads input, performs calculations, and prints the resulting path.
 *
 * @param {string} rawData The raw string input, typically from standard input.
 */
function processInputData(rawData) {
  // Process the input string: trim whitespace, split by any whitespace, and convert parts to numbers.
  let parsedInput = rawData.trim().split(/\s+/).map(val => val - 0x0);

  // Extract the number of bits (N), the starting value (A), and the ending value (B).
  let numBits = parsedInput.shift();
  let startValue = parsedInput.shift();
  let endValue = parsedInput.shift();

  // Calculate the bitwise XOR of A and B. This highlights the bits that differ between A and B.
  let xorResult = startValue ^ endValue;

  // Initialize arrays to store the indices of bits that are 0 or 1 in the xorResult.
  let zeroBitPositions = [];
  let oneBitPositions = [];

  // Iterate through each bit position from 0 to N-1.
  for (let loopCounter = 0x0; loopCounter < numBits; loopCounter++) {
    // Check the least significant bit of xorResult.
    if (xorResult % 0x2 === 0x0) {
      // If it's 0, store its original bit position.
      zeroBitPositions.push(loopCounter);
    } else {
      // If it's 1, store its original bit position.
      oneBitPositions.push(loopCounter);
    }
    // Right-shift xorResult to examine the next bit in the subsequent iteration.
    xorResult = Math.floor(xorResult / 0x2);
  }

  // Critical condition check: If the count of differing bits (ones in xorResult) is even,
  // it's impossible to form the required path.
  if (oneBitPositions.length % 0x2 === 0x0) {
    console.log('NO'); // Output 'NO' and terminate.
    return;
  }

  // If the condition is met, a path is possible.
  console.log('YES');

  // --- Generate Gray code sequence for bits that are 0 in (A XOR B) ---
  let graySubsetA = [0x0]; // Start with 0.
  // Generate Gray code for (length of zeroBitPositions - 1) bits.
  generateGraySequence(graySubsetA, zeroBitPositions.length - 0x1);

  // Map the generated Gray code values to their actual bit positions.
  for (let loopCounter = 0x0; loopCounter < graySubsetA.length; loopCounter++) {
    let accumulator = 0x0;
    for (let innerLoopCounter = 0x0; innerLoopCounter < zeroBitPositions.length; innerLoopCounter++) {
      // If the 'innerLoopCounter'-th bit of graySubsetA[loopCounter] is set,
      // add 2 raised to the power of the corresponding actual bit position.
      accumulator += ((graySubsetA[loopCounter] >> innerLoopCounter) % 0x2) * Math.pow(0x2, zeroBitPositions[innerLoopCounter]);
    }
    graySubsetA[loopCounter] = accumulator;
  }
  graySubsetA.shift(); // Remove the initial 0.

  // --- Generate inverted Gray path for bits that are 1 in (A XOR B) ---
  let graySubsetB = [0x0]; // Start with 0.
  // Generate the inverted Gray path using (length of oneBitPositions - 1) as the parameter.
  createInvertedGrayPath(graySubsetB, oneBitPositions.length - 0x1);

  // Map the generated inverted Gray path values to their actual bit positions.
  for (let loopCounter = 0x0; loopCounter < graySubsetB.length; loopCounter++) {
    let accumulator = 0x0;
    for (let innerLoopCounter = 0x0; innerLoopCounter < oneBitPositions.length; innerLoopCounter++) {
      // If the 'innerLoopCounter'-th bit of graySubsetB[loopCounter] is set,
      // add 2 raised to the power of the corresponding actual bit position.
      accumulator += ((graySubsetB[loopCounter] >> innerLoopCounter) % 0x2) * Math.pow(0x2, oneBitPositions[innerLoopCounter]);
    }
    graySubsetB[loopCounter] = accumulator;
  }
  graySubsetB.shift(); // Remove the initial 0.

  // --- Construct the final sequence of numbers (the path) ---
  let finalPath = [startValue]; // The path begins with the starting value A.

  // Iterate through each element in the 'graySubsetB' (inverted Gray path).
  for (let loopCounter = 0x0; loopCounter < graySubsetB.length; loopCounter++) {
    let previousValue = finalPath[finalPath.length - 0x1]; // Get the last number added to the path.
    // For each 'previousValue', append the entire 'graySubsetA' sequence XORed with it.
    for (let innerLoopCounter = 0x0; innerLoopCounter < graySubsetA.length; innerLoopCounter++) {
      finalPath.push(previousValue ^ graySubsetA[innerLoopCounter]);
    }
    // After appending the 'graySubsetA' sequence, XOR the current last element of 'finalPath'
    // with the current element from 'graySubsetB' and append it.
    finalPath.push(finalPath[finalPath.length - 0x1] ^ graySubsetB[loopCounter]);
  }
  // The path must end with the target value B.
  finalPath.push(endValue);

  // Print the complete path, with numbers separated by spaces.
  console.log(finalPath.join(' '));
}

// Entry point: Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
