function processInputString(rawData) {
  "use strict"; // Ensure strict mode for robust JavaScript.

  // This function processes a string of 'R' and 'L' characters
  // to determine a specific distribution pattern based on "RL" boundaries.
  // It aims to count how many 'R's and 'L's are "captured" by each "RL" pair.

  // Type III: Guard clause for empty or invalid input.
  if (!rawData || rawData.trim().length === 0) {
    console.log(""); // Output an empty line for no input.
    return;
  }

  // Type II: Renamed identifier for clarity.
  const processingString = rawData;

  // Type III: Refactor segment generation.
  // The original code used `s.split("LR").map(...).slice(...)` to create segments.
  // This block reconstructs that logic more explicitly by handling prefixes and suffixes.
  const temporaryParts = processingString.split("LR");
  const finalSegmentList = [];
  const totalTemporaryParts = temporaryParts.length;

  // Iterate through the parts obtained from splitting by "LR".
  // Each part needs to be augmented with 'R' or 'L' based on its position
  // to correctly form the logical segments for processing.
  for (let partIndex = 0; partIndex < totalTemporaryParts; ++partIndex) {
    let currentSubsegment = temporaryParts[partIndex];

    // If it's not the very first part, it means it was preceded by an "LR" boundary.
    // The 'R' from that boundary belongs to this segment.
    if (partIndex > 0) {
      currentSubsegment = 'R' + currentSubsegment;
    }

    // If it's not the very last part, it means it will be followed by an "LR" boundary.
    // The 'L' from that boundary belongs to this segment.
    if (partIndex < totalTemporaryParts - 1) {
      currentSubsegment = currentSubsegment + 'L';
    }
    finalSegmentList.push(currentSubsegment);
  }

  // Type II: Renamed array to hold the calculated results.
  const resultAccumulator = [];

  // Type II: Using a `for...of` loop for iterating over segments,
  // enhancing readability over `forEach` in some contexts.
  // Process each reconstructed segment individually.
  for (const currentSegment of finalSegmentList) {
    // Type II: Renamed identifier for segment length.
    const currentSegmentLength = currentSegment.length;

    // Type II: Using a standard `for` loop with a renamed iterator for character positions.
    // Iterate through each character position within the current segment.
    for (let charPosition = 0; charPosition < currentSegmentLength; ++charPosition) {
      // Type III: Introduce a boolean flag for the boundary condition for better readability.
      // This is the crucial condition where an 'RL' boundary is detected.
      const isBoundaryConditionMet = charPosition > 0 &&
                                     currentSegment[charPosition - 1] === "R" &&
                                     currentSegment[charPosition] === "L";

      if (isBoundaryConditionMet) {
        // Type III: Instead of `ans.pop()` followed by two `push()`,
        // directly update the last element and then push the new one.
        // This effectively replaces the `0` that was pushed for the 'R' character
        // at `charPosition - 1` with its calculated value.

        // Count of 'R's from the start of the segment up to the 'R' in the 'RL' pair.
        const countR = charPosition;
        // Count of 'L's from the 'L' in the 'RL' pair to the end of the segment.
        const countL = currentSegmentLength - charPosition;

        // Type III: Introduce intermediate variables for clarity in calculations.
        const isRCountGreaterThanL = (countR > countL);
        const isMinCountEven = (Math.min(countR, countL) % 2 === 0);

        // Type II & III: Renamed and rephrased the XOR logic.
        // This flag determines the distribution bias when the segment length is odd.
        // It's equivalent to the original `c = a ^ b` logic.
        // `distributionParityFlag` is 0 if `isRCountGreaterThanL` and `isMinCountEven`
        // have the same truth value, and 1 if they differ.
        const distributionParityFlag = (isRCountGreaterThanL === isMinCountEven) ? 0 : 1;

        let valueForLeftPart;  // Value assigned to the 'R' part of the 'RL' boundary.
        let valueForRightPart; // Value assigned to the 'L' part of the 'RL' boundary.

        // Type III: Break down conditional logic for assigning distribution values.
        // Handle even and odd segment lengths separately.
        if (currentSegmentLength % 2 === 0) {
          // If the segment length is even, the counts are distributed equally.
          valueForLeftPart = currentSegmentLength / 2;
          valueForRightPart = currentSegmentLength / 2;
        } else {
          // If the segment length is odd, the distribution depends on the `distributionParityFlag`.
          if (distributionParityFlag === 0) {
            // One side gets (length+1)/2, the other (length-1)/2.
            // When flag is 0, the 'R' side (left) gets the larger share.
            valueForLeftPart = (currentSegmentLength + 1) / 2;
            valueForRightPart = (currentSegmentLength - 1) / 2;
          } else {
            // When flag is 1, the 'L' side (right) gets the larger share.
            valueForLeftPart = (currentSegmentLength - 1) / 2;
            valueForRightPart = (currentSegmentLength + 1) / 2;
          }
        }

        // Update the last element (for the 'R' at `charPosition - 1`)
        // and append the new element (for the 'L' at `charPosition`).
        resultAccumulator[resultAccumulator.length - 1] = valueForLeftPart;
        resultAccumulator.push(valueForRightPart);

      } else {
        // If the current character position is not part of an "RL" boundary,
        // a zero placeholder is pushed.
        resultAccumulator.push(0);
      }
    }
  }

  // Type II: Reworded output statement.
  // Join the calculated counts with spaces and append a newline character.
  console.log(resultAccumulator.join(" ") + "\n");
}

// Type II: Rewritten comment for standard input handling.
// The following line is standard boilerplate for competitive programming in Node.js.
// It reads the entire standard input, converts it to a UTF-8 string,
// and passes it to the main processing function.
// This part should typically not be modified.
processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));