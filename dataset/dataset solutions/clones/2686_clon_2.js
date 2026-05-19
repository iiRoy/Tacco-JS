function ProcessInput(rawData) {
  "use strict"; // Enforce strict parsing and error handling

  // The input string is the primary data source.
  const sourceString = rawData;

  // Split the source string by "LR" and wrap each segment with "R" and "L".
  // This prepares segments for individual processing.
  const segmentList = sourceString.split("LR").map(segmentPart => {
    return "R" + segmentPart + "L";
  });

  // Determine the total number of segments created.
  const totalSegments = segmentList.length;

  // Adjust the first segment by removing its leading "R".
  // This handles the case where the original string might not start with "LR".
  segmentList[0x0] = segmentList[0x0].slice(0b1);

  // Adjust the last segment by removing its trailing "L".
  // This handles the case where the original string might not end with "LR".
  segmentList[totalSegments - 0b1] = segmentList[totalSegments - 0b1].slice(0x0, -0b1);

  // Initialize an array to store the calculated results.
  const resultArray = [];

  // Iterate over each processed segment.
  segmentList.forEach(currentSegment => {
    // Get the length of the current segment.
    const segmentLength = currentSegment.length;

    // Loop through each character position within the current segment.
    for (let idx = 0x0; idx < segmentLength; idx++) {
      // Check for the "RL" boundary condition within the segment.
      // This identifies the point where 'R's transition to 'L's.
      if (idx !== 0x0 && currentSegment[idx - 0b1] === "R" && currentSegment[idx] === "L") {
        // If an "RL" boundary is found, remove the last added zero.
        // This zero was added for the 'R' just before the 'L' boundary.
        resultArray.pop();

        // Calculate the number of 'R's (right-moving elements) before the boundary.
        const rightCount = idx;
        // Calculate the number of 'L's (left-moving elements) after the boundary.
        const leftCount = segmentLength - idx;

        // Determine a parity based on which count is greater.
        const parityDiff = (rightCount > leftCount) ? 0x0 : 0b1;
        // Determine a parity based on whether the minimum of the counts is even or odd.
        const minParity = (Math.min(rightCount, leftCount) % 0x2 === 0x0) ? 0x0 : 0b1;
        // Combine the parities using XOR.
        const finalParity = parityDiff ^ minParity;

        // Distribute the segment length based on its parity and the calculated final parity.
        if (segmentLength % 0x2 === 0x0) {
          // If the segment length is even, distribute equally.
          resultArray.push(segmentLength / 0x2);
          resultArray.push(segmentLength / 0x2);
        } else if (finalParity === 0x0) {
          // If segment length is odd and final parity is 0, distribute (N+1)/2 and (N-1)/2.
          resultArray.push((segmentLength + 0b1) / 0x2);
          resultArray.push((segmentLength - 0b1) / 0x2);
        } else {
          // If segment length is odd and final parity is 1, distribute (N-1)/2 and (N+1)/2.
          resultArray.push((segmentLength - 0b1) / 0x2);
          resultArray.push((segmentLength + 0b1) / 0x2);
        }
      } else {
        // If not an "RL" boundary, push a zero.
        resultArray.push(0x0);
      }
    }
  });

  // Output the final results joined by spaces.
  console.log(resultArray.join(" "));
}

// This line should not be modified (reads from standard input and calls ProcessInput).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
