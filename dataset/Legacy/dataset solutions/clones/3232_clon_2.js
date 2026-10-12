"use strict";

/**
 * Processes raw input data to calculate a maximum possible score based on bitwise operations.
 * This function parses numerical tokens, converts them to fixed-length binary strings,
 * computes bit position sums, and then iterates through potential binary masks
 * derived from a target value to find the highest score.
 * @param {string} sourceText - The raw input string containing numbers separated by spaces or newlines.
 */
function ProcessInput(sourceText) {
  // Array to store parsed integer tokens
  let numericTokens = [];
  // Index for populating the numericTokens array
  let tokenIndex = 0;

  // Regular expression to match a sequence of digits at the beginning of the string
  const digitPattern = /^\d+/;
  // Regular expression to match a space or newline character
  const whitespacePattern = / |\n/;

  // Loop to extract all numbers from the input string
  while (sourceText.length > 0) {
    // Check if the current start of the string matches a number
    if (sourceText.match(digitPattern)) {
      // Extract the number, store it, and remove it from the source string
      numericTokens[tokenIndex] = sourceText.match(digitPattern)[0];
      sourceText = sourceText.replace(digitPattern, "");
      tokenIndex++;
      continue; // Continue to the next iteration to find more numbers
    }
    // If no number is found, remove any leading whitespace
    sourceText = sourceText.replace(whitespacePattern, "");
    continue; // Continue to the next iteration
  }

  // Replace the original input string with the array of parsed numbers
  sourceText = numericTokens;

  // Parse the first two numbers from the array
  const numItems = parseInt(sourceText[0]); // N in original
  let limitValueBin = parseInt(sourceText[1]).toString(2); // K in original

  // Pad the binary string 'K' with leading zeros to a fixed length of 50
  while (limitValueBin.length < 50) {
    limitValueBin = "0" + limitValueBin;
  }

  // Remove the first two elements (N and K) from the parsed numbers array
  sourceText.shift();
  sourceText.shift();

  // Array to store binary representations of the remaining numbers
  let itemBins = []; // A in original
  // Convert each remaining number to a 50-bit binary string
  for (let i = 0; i < numItems; i++) {
    itemBins[i] = parseInt(sourceText[i]).toString(2);
    // Pad with leading zeros to ensure 50-bit length
    while (itemBins[i].length < 50) {
      itemBins[i] = "0" + itemBins[i];
    }
  }

  // Array to store the sum of bits at each position across all itemBins
  let bitPositionCounts = []; // digSum in original
  // Calculate the sum of '1's for each bit position (0 to 49)
  for (let i = 0; i < 50; i++) {
    bitPositionCounts[i] = 0; // Initialize sum for current bit position
    for (let innerIdx = 0; innerIdx < numItems; innerIdx++) {
      // Add 1 if the bit at position 'i' is '1', otherwise add 0
      bitPositionCounts[i] += itemBins[innerIdx][i] === "1" ? 1 : 0;
    }
  }

  // Variable to store the maximum calculated score
  let maximumScore = 0; // counterMax in original

  // Calculate L = K + 1 (where K is the original integer value)
  const limitPlusOne = parseInt(limitValueBin, 2) + 1; // L in original
  // Convert L to its binary string representation
  let limitPlusOneBin = limitPlusOne.toString(2); // M in original

  // Array to store indices of '1's in limitPlusOneBin
  let setBitPositions = [0]; // a in original
  let currentPos = 0; // b in original
  let oneIndex = 0; // i in original (for setBitPositions array)

  // Find all indices where '1' appears in limitPlusOneBin
  while (currentPos !== -1) {
    currentPos = limitPlusOneBin.indexOf("1", currentPos + 1);
    setBitPositions[oneIndex] = currentPos;
    oneIndex++;
  }
  setBitPositions.pop(); // Remove the last element which is -1 from the loop condition

  // Iterate through each '1' bit position found in limitPlusOneBin
  for (let positionIterator = 0; positionIterator < setBitPositions.length; positionIterator++) {
    let currentScore = 0; // counter in original
    let candidateBin = []; // X in original

    // Copy bits from limitPlusOneBin up to the current '1' position
    for (let charIndex = 0; charIndex < setBitPositions[positionIterator]; charIndex++) {
      candidateBin[charIndex] = limitPlusOneBin[charIndex];
    }
    // Set the bit at the current '1' position to '0'
    candidateBin[setBitPositions[positionIterator]] = "0";

    // For subsequent bits, choose '1' if 2*digSum[l] < N, otherwise '0'
    // This strategy maximizes the score for the remaining bits
    for (let charIndex = setBitPositions[positionIterator] + 1; charIndex < limitPlusOneBin.length; charIndex++) {
      candidateBin[charIndex] = 2 * bitPositionCounts[charIndex] < numItems ? 1 : 0;
    }

    // Join the array of characters to form the full binary string
    let finalCandidateBin = candidateBin.join("");
    // Pad with leading zeros to ensure 50-bit length if necessary
    while (finalCandidateBin.length < 50) {
      finalCandidateBin = "0" + finalCandidateBin;
    }

    // Calculate the score for the current candidate binary string
    // This loop iterates through each bit position (0 to 49)
    for (let i = 0; i < 50; i++) {
      // If the bit in finalCandidateBin is '0', use bitPositionCounts[i] (count of '1's)
      // If the bit in finalCandidateBin is '1', use N - bitPositionCounts[i] (count of '0's)
      // Multiply by 2^(49-i) to get its positional value
      currentScore +=
        (finalCandidateBin[i] === "0" ? bitPositionCounts[i] : numItems - bitPositionCounts[i]) *
        Math.pow(2, 49 - i);
    }
    // Update the maximum score if the current score is higher
    maximumScore = Math.max(maximumScore, currentScore);
  }

  // Output the final maximum score
  console.log(maximumScore);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
