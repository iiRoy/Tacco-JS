function ProcessInputData(rawData) {
  if (typeof rawData !== 'string' || rawData.length === 0) {
    // Input validation: Ensure the provided data is a non-empty string.
    // This is a new guard clause to improve robustness.
    console.error("Error: Input data must be a non-empty string.");
    return;
  }

  const sourceString = rawData; // Renamed 's' to 'sourceString'

  // Split the input string by "LR" and then wrap each resulting part.
  // 'division' becomes 'segmentCollection', 'e' becomes 'segmentPart'.
  // Using a concise arrow function syntax.
  const segmentCollection = sourceString.split("LR").map(segmentPart => "R" + segmentPart + "L");

  const totalSegmentCount = segmentCollection.length; // Renamed 'len' to 'totalSegmentCount'

  // Adjust the first and last segments to remove the artificial 'R' and 'L' added for processing.
  // Using 'substring' instead of 'slice' for variety, though functionally equivalent here.
  if (totalSegmentCount > 0) { // Added a check to prevent errors on empty splits.
    segmentCollection[0] = segmentCollection[0].substring(1); // Remove the leading 'R' from the first segment
    const lastSegmentIndex = totalSegmentCount - 1;
    const lastSegment = segmentCollection[lastSegmentIndex];
    segmentCollection[lastSegmentIndex] = lastSegment.substring(0, lastSegment.length - 1); // Remove the trailing 'L' from the last segment
  }

  // This array will store the final computed distribution results.
  const finalDistributionResultArray = []; // Renamed 'ans' to 'finalDistributionResultArray'

  // Helper function to calculate the distribution for an odd-length segment.
  // This extracts and rewrites the original 'a, b, c' logic for clarity and structural change.
  const calculateOddSegmentDistribution = (currentSegmentLength, boundaryPosition) => {
    // 'boundaryPosition' is equivalent to 'i' or 'rNum' from the original code.
    // It represents the count of 'R' characters before the 'L' in the 'RL' boundary.
    const leftSideCount = boundaryPosition;
    const rightSideCount = currentSegmentLength - boundaryPosition;

    let rSideOutput, lSideOutput;
    const largerHalf = Math.ceil(currentSegmentLength / 2);
    const smallerHalf = Math.floor(currentSegmentLength / 2);

    // The logic here determines which side of the 'RL' boundary gets the extra '1'
    // when the segment length is odd. This is a rewrite of the `a ^ b` logic.
    // If the count of 'R's (leftSideCount) is odd, the 'R' side (index boundaryPosition-1)
    // gets the larger share. Otherwise, the 'L' side (index boundaryPosition) gets it.
    if (leftSideCount % 2 !== 0) { // If leftSideCount (rNum) is odd
      rSideOutput = largerHalf;
      lSideOutput = smallerHalf;
    } else { // If leftSideCount (rNum) is even
      rSideOutput = smallerHalf;
      lSideOutput = largerHalf;
    }
    return [rSideOutput, lSideOutput];
  };

  // Iterate over each segment in the collection to calculate distributions.
  // 'e' becomes 'currentSegment', 'len' becomes 'currentSegmentLength', 'i' becomes 'charPositionIndex'.
  segmentCollection.forEach(currentSegment => {
    const currentSegmentLength = currentSegment.length;

    // Initialize an array for the current segment's results, pre-filled with zeros.
    // This structural change eliminates the need for `ans.pop()` and the `else ans.push(0)`
    // within the loop, as non-boundary positions will remain zero.
    const segmentSpecificResults = new Array(currentSegmentLength).fill(0);

    for (let charPositionIndex = 0; charPositionIndex < currentSegmentLength; charPositionIndex++) {
      // Look for the "RL" pattern which signifies a boundary point.
      if (charPositionIndex > 0 && currentSegment[charPositionIndex - 1] === "R" && currentSegment[charPositionIndex] === "L") {
        let finalCountForR = 0; // The number of elements ending at the 'R' side of the boundary
        let finalCountForL = 0; // The number of elements ending at the 'L' side of the boundary

        if (currentSegmentLength % 2 === 0) {
          // For even length segments, the distribution is always equal.
          finalCountForR = currentSegmentLength / 2;
          finalCountForL = currentSegmentLength / 2;
        } else {
          // For odd length segments, use the helper function for distribution.
          const [rVal, lVal] = calculateOddSegmentDistribution(currentSegmentLength, charPositionIndex);
          finalCountForR = rVal;
          finalCountForL = lVal;
        }

        // Assign the calculated counts to the corresponding positions in the results array.
        // The 'R' character is at 'charPositionIndex - 1', and the 'L' character is at 'charPositionIndex'.
        segmentSpecificResults[charPositionIndex - 1] = finalCountForR;
        segmentSpecificResults[charPositionIndex] = finalCountForL;
      }
      // Positions that are not part of an 'RL' boundary remain 0 due to `fill(0)`.
    }
    // Append the results for the current segment to the overall results array.
    finalDistributionResultArray.push(...segmentSpecificResults);
  });

  // Output the final results, joined by a single space.
  console.log(finalDistributionResultArray.join(" "));
}

// This section handles standard input/output for competitive programming environments.
// It reads the entire content from /dev/stdin and passes it to the main processing function.
// The core functionality of this block is preserved, but variable names and comments are updated.
(function() {
  const fileSystemModule = require("fs");
  const standardInputFilePath = "/dev/stdin";
  const textEncoding = "utf8";

  try {
    const inputContent = fileSystemModule.readFileSync(standardInputFilePath, textEncoding);
    ProcessInputData(inputContent);
  } catch (ioError) {
    // Added error handling for file system operations.
    console.error(`An error occurred while reading input: ${ioError.message}`);
    // Optionally, one could call ProcessInputData with a default/empty string
    // or exit the process depending on requirements.
    // ProcessInputData("");
  }
})();