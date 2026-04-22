// This module encapsulates the core logic for analyzing a character sequence
// to determine the minimum number of transformations required to conform to a pattern.

const processInputData = function(sourceDataString) {
  // Validate the incoming data. A robust system should handle null/undefined or non-string inputs.
  // If the input is invalid or empty, an error message is logged, and the function exits.
  if (!sourceDataString || typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
    console.error("Input validation error: The provided data is either empty or not a valid string.");
    return; // Halt execution for invalid input to prevent further errors.
  }

  // Split the raw input content into individual lines.
  // The problem statement implies that the sequence of interest is located on the second line.
  const allInputLines = sourceDataString.split('\n');

  // Ensure that the input contains at least two lines, as the second line is crucial for processing.
  if (allInputLines.length < 2) {
    console.error("Input format error: Expecting at least two lines of data, but fewer were found.");
    return; // Exit if the expected format is not met.
  }

  // Extract the specific character sequence that needs to be analyzed.
  let targetCharacterSequence = allInputLines[1];

  // If the extracted target sequence is empty, no transformations are needed.
  // This is an edge case handled explicitly.
  if (targetCharacterSequence.length === 0) {
    console.log(0); // Zero changes needed for an empty string.
    return;
  }

  // Initialize a variable to keep track of the smallest transformation cost encountered so far.
  // Using JavaScript's built-in `Infinity` is a clear and idiomatic way to set an initial maximum value.
  let minimumTransformationCost = Infinity;

  // Cache the length of the sequence for efficiency, avoiding repeated property access within the loop.
  const sequenceLengthValue = targetCharacterSequence.length;

  // Iterate through each character in the sequence. Each character will be considered as a potential 'pivot' point.
  // The 'pivot' conceptually divides the string into a 'left' segment and a 'right' segment.
  for (let currentPivotIndex = 0; currentPivotIndex < sequenceLengthValue; ++currentPivotIndex) {

    // The character currently acting as the divider. Its value does not directly contribute to the transformation cost.
    const centralPivotCharacter = targetCharacterSequence[currentPivotIndex];

    // Define the segment of characters located immediately before the current pivot.
    // The `substring(0, currentPivotIndex)` method gracefully handles the case where `currentPivotIndex` is 0,
    // resulting in an empty string, which is the correct behavior for the leftmost pivot.
    const precedingSegment = targetCharacterSequence.substring(0, currentPivotIndex);

    // Define the segment of characters located immediately after the current pivot.
    // Similarly, `substring(currentPivotIndex + 1)` correctly handles the case where the pivot is the last character,
    // yielding an empty string for the rightmost pivot.
    const succeedingSegment = targetCharacterSequence.substring(currentPivotIndex + 1);

    // This variable will accumulate the total cost for the current pivot configuration.
    let cumulativeMismatchScore = 0;

    // A small helper constant to make increment operations explicit and potentially easier to modify.
    const unitIncrement = 1;

    // Calculate the transformation cost for the preceding segment.
    // Characters to the left of the pivot are ideally expected to be 'E'.
    for (let charScanIndexLeft = 0; charScanIndexLeft < precedingSegment.length; ++charScanIndexLeft) {
      const charInLeftSegment = precedingSegment[charScanIndexLeft];
      if (charInLeftSegment !== "E") {
        cumulativeMismatchScore += unitIncrement; // Increment the score if the character is not 'E'.
      }
    }

    // Calculate the transformation cost for the succeeding segment.
    // Characters to the right of the pivot are ideally expected to be 'W'.
    for (let charScanIndexRight = 0; charScanIndexRight < succeedingSegment.length; ++charScanIndexRight) {
      const charInRightSegment = succeedingSegment[charScanIndexRight];
      if (charInRightSegment !== "W") {
        cumulativeMismatchScore += unitIncrement; // Increment the score if the character is not 'W'.
      }
    }

    // After calculating the cost for the current pivot configuration,
    // update the global minimum cost if this configuration yields a lower score.
    minimumTransformationCost = Math.min(minimumTransformationCost, cumulativeMismatchScore);
  }

  // Display the final computed minimum transformation cost to the standard output.
  console.log(minimumTransformationCost);
};

// The primary entry point for executing this script.
// It reads the entire file content from standard input, ensuring UTF-8 encoding for proper character handling,
// and then passes this raw data string to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8'));