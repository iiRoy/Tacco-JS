"use strict"; // Enforce strict parsing and error handling for cleaner code

function ExecuteProcess(rawTextData) {
  // A dynamic collection to hold numeric strings extracted from the input
  let parsedNumbers = [];
  let currentNumIndex = 0; // Index for populating the parsedNumbers array

  // Regular expression to identify a sequence of one or more digits at the start of a string
  const regexDigitPattern = /^\d+/;
  // Regular expression to identify either a space or a newline character
  const regexWhitespace = / |\n/;

  // Iterate as long as there's unhandled content in the raw input string
  while (rawTextData.length > 0) {
    // Attempt to match a number at the beginning of the current rawTextData
    if (rawTextData.match(regexDigitPattern)) {
      // If a number is found, store it in the collection
      parsedNumbers[currentNumIndex] = rawTextData.match(regexDigitPattern)[0];
      // Remove the extracted number from the raw input string
      rawTextData = rawTextData.replace(regexDigitPattern, "");
      currentNumIndex++; // Advance the index for the next number
      continue; // Proceed to the next iteration of the loop
    }

    // If no number is found, it must be whitespace; remove leading whitespace
    rawTextData = rawTextData.replace(regexWhitespace, "");
    continue; // Proceed to the next iteration of the loop
  }

  // After extraction, the rawTextData variable is re-assigned to hold the array of parsed numbers
  rawTextData = parsedNumbers;

  // The first extracted number represents the total count of subsequent elements
  const countElements = parseInt(rawTextData[0], 10);
  // The second extracted number is converted to its binary string representation
  let targetBinaryString = parseInt(rawTextData[1], 10).toString(2);

  // Pad the target binary string with leading zeros to ensure a fixed length of 50 bits
  while (targetBinaryString.length < 50) {
    targetBinaryString = "0" + targetBinaryString;
  }

  // Remove the first two elements (countElements and targetBinaryString's original value)
  // as they have been processed
  rawTextData.shift();
  rawTextData.shift();

  // An array to store the binary representations of the remaining input numbers
  const binaryValues = [];
  // Iterate through the remaining numbers to convert them to fixed-length binary strings
  for (let dataIter = 0; dataIter < countElements; dataIter++) {
    binaryValues[dataIter] = parseInt(rawTextData[dataIter], 10).toString(2);
    // Pad each binary string with leading zeros to a standard length of 50 bits
    while (binaryValues[dataIter].length < 50) {
      binaryValues[dataIter] = "0" + binaryValues[dataIter];
    }
  }

  // Initialize an array to sum the bits at each corresponding position across all binary values
  const bitPositionSums = [];
  for (let bitPosition = 0; bitPosition < 50; bitPosition++) {
    bitPositionSums[bitPosition] = 0; // Initialize the sum for the current bit position
    for (let entryIndex = 0; entryIndex < countElements; entryIndex++) {
      // Increment the sum if the bit at the current position is '1'
      bitPositionSums[bitPosition] += (binaryValues[entryIndex][bitPosition] === "1") ? 1 : 0;
    }
  }
  
  // Variable to keep track of the highest calculated score
  let maximumScore = 0;
  // Convert the target binary string back to an integer, then add one
  const targetValuePlusOne = parseInt(targetBinaryString, 2) + 1;
  // Convert this incremented numeric value back into its binary string form
  let targetPlusOneBinary = targetValuePlusOne.toString(2);

  // Identify all indices where a '1' bit appears in the targetPlusOneBinary string
  const oneBitIndices = [0,]; // Placeholder to ensure array is created
  let searchStartPoint = 0;
  let currentBitIndexCount = 0;
  while (searchStartPoint !== -1) {
    searchStartPoint = targetPlusOneBinary.indexOf("1", searchStartPoint + 1);
    oneBitIndices[currentBitIndexCount] = searchStartPoint;
    currentBitIndexCount++;
  }
  oneBitIndices.pop(); // Remove the last entry, which will be -1 (or undefined if no '1's found)

  // Iterate through each identified '1' bit position in targetPlusOneBinary
  for (let indexIter = 0; indexIter < oneBitIndices.length; indexIter++) {
    let currentScore = 0;
    const candidateBinary = []; // Array to construct a new binary candidate string

    // Copy bits from targetPlusOneBinary up to the current '1' bit position
    for (let prefixPosition = 0; prefixPosition < oneBitIndices[indexIter]; prefixPosition++) {
      candidateBinary[prefixPosition] = targetPlusOneBinary[prefixPosition];
    }

    // At the current '1' bit position, set the candidate bit to '0'
    candidateBinary[oneBitIndices[indexIter]] = "0";

    // For all subsequent bit positions, choose '1' if it maximizes the score (i.e., if 2 * sum of '1's < N)
    for (let suffixPosition = oneBitIndices[indexIter] + 1; suffixPosition < targetPlusOneBinary.length; suffixPosition++) {
      candidateBinary[suffixPosition] = (2 * bitPositionSums[suffixPosition] < countElements) ? 1 : 0;
    }

    // Combine the candidate bits into a single string
    let finalCandidateString = candidateBinary.join("");
    // Ensure the candidate binary string is exactly 50 bits long by padding with leading zeros
    while (finalCandidateString.length < 50) {
      finalCandidateString = "0" + finalCandidateString;
    }

    // Calculate the score for the newly constructed candidate binary string
    for (let scoreBitPosition = 0; scoreBitPosition < 50; scoreBitPosition++) {
      // If the candidate bit is '0', add the total count of '1's at that position from original data
      // If the candidate bit is '1', add the total count of '0's at that position from original data (N - sum of '1's)
      currentScore += ((finalCandidateString[scoreBitPosition] === "0") ? bitPositionSums[scoreBitPosition] : countElements - bitPositionSums[scoreBitPosition]) * Math.pow(2, 49 - scoreBitPosition);
    }
    
    // Update the maximum score if the current candidate's score is higher
    maximumScore = Math.max(maximumScore, currentScore);
  }

  // Print the ultimate maximum score found to the console
  console.log(maximumScore);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function
ExecuteProcess(require("fs").readFileSync("/dev/stdin", "utf8"));