"use strict";

// Utility function to ensure a binary string has a specific length by padding with leading zeros.
function padBinaryString(binaryRepresentation, targetLength) {
  let currentString = String(binaryRepresentation);
  while (currentString.length < targetLength) {
    currentString = "0" + currentString;
  }
  return currentString;
}

// Utility function to parse the raw input string into an array of numeric strings.
function extractNumericStrings(rawInputText) {
  // Splits the input by any sequence of whitespace (spaces or newlines)
  // and filters out any empty strings that might result from multiple delimiters.
  return rawInputText.split(/[\s\n]+/).filter(segment => segment.length > 0);
}

// Utility function to find all zero-based indices where '1' appears in a binary string.
function locateOneBitIndices(binarySequence) {
  const foundIndices = [];
  let searchStart = -1;
  while ((searchStart = binarySequence.indexOf("1", searchStart + 1)) !== -1) {
    foundIndices.push(searchStart);
  }
  return foundIndices;
}

function Main(rawInputData) {
  const parsedNumericStrings = extractNumericStrings(rawInputData);

  let currentParseIndex = 0; // Tracks position in parsedNumericStrings
  const numberOfElements = parseInt(parsedNumericStrings[currentParseIndex++]);
  let initialLimitBinary = parseInt(parsedNumericStrings[currentParseIndex++]).toString(2);

  const FIXED_BINARY_BIT_LENGTH = 50; // Constant for the fixed bit length

  initialLimitBinary = padBinaryString(initialLimitBinary, FIXED_BINARY_BIT_LENGTH);

  const inputDataBinaryStrings = [];
  for (let i = 0; i < numberOfElements; i++) {
    const currentNumericValue = parseInt(parsedNumericStrings[currentParseIndex++]);
    inputDataBinaryStrings.push(padBinaryString(currentNumericValue.toString(2), FIXED_BINARY_BIT_LENGTH));
  }

  // Calculate the sum of '1's for each bit position across all input numbers.
  const bitPositionOneCounts = new Array(FIXED_BINARY_BIT_LENGTH).fill(0);
  for (let bitPos = 0; bitPos < FIXED_BINARY_BIT_LENGTH; bitPos++) {
    for (let dataEntryIndex = 0; dataEntryIndex < numberOfElements; dataEntryIndex++) {
      if (inputDataBinaryStrings[dataEntryIndex][bitPos] === "1") {
        bitPositionOneCounts[bitPos]++;
      }
    }
  }

  let overallMaximumScore = 0;

  // Calculate L = K + 1 and its binary representation M
  const limitPlusOneDecimal = parseInt(initialLimitBinary, 2) + 1;
  let limitPlusOneBinaryString = limitPlusOneDecimal.toString(2);
  limitPlusOneBinaryString = padBinaryString(limitPlusOneBinaryString, FIXED_BINARY_BIT_LENGTH);

  // Find all positions of '1's in M (limitPlusOneBinaryString)
  const oneBitPositionsInM = locateOneBitIndices(limitPlusOneBinaryString);

  // Iterate through each '1' position in M to construct candidate X values
  for (const currentOneBitPosition of oneBitPositionsInM) {
    let candidateXBinaryArray = new Array(FIXED_BINARY_BIT_LENGTH);

    // Copy bits from M up to the current '1' position
    for (let p = 0; p < currentOneBitPosition; p++) {
      candidateXBinaryArray[p] = limitPlusOneBinaryString[p];
    }

    // Set the current '1' position to '0' in X
    candidateXBinaryArray[currentOneBitPosition] = "0";

    // For subsequent bits, choose '1' if it's the majority, '0' otherwise
    for (let p = currentOneBitPosition + 1; p < FIXED_BINARY_BIT_LENGTH; p++) {
      // If 2 * count_of_ones < total_elements, then '1' is the minority or equal, so setting '1' is optimal for XOR sum
      candidateXBinaryArray[p] = (2 * bitPositionOneCounts[p] < numberOfElements) ? "1" : "0";
    }

    const finalCandidateXString = candidateXBinaryArray.join("");

    let currentCalculatedScore = 0;
    // Calculate the score for the constructed X
    for (let p = 0; p < FIXED_BINARY_BIT_LENGTH; p++) {
      const bitContribution = (finalCandidateXString[p] === "0") ? bitPositionOneCounts[p] : numberOfElements - bitPositionOneCounts[p];
      // Using bit shift for 2^exponent is a common optimization and Type III change
      currentCalculatedScore += bitContribution * (1 << (FIXED_BINARY_BIT_LENGTH - 1 - p));
    }
    overallMaximumScore = Math.max(overallMaximumScore, currentCalculatedScore);
  }

  console.log(overallMaximumScore);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
