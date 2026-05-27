function Main(rawData) {
  "use strict";
  const inputString = rawData;

  // Helper function to encapsulate the mapping logic
  const processSegmentPart = (segmentPart) => {
    return "R" + segmentPart + "L";
  };

  // Split the input string and then map the parts
  const intermediateSegments = inputString.split("LR");
  const segmentList = intermediateSegments.map(processSegmentPart);

  const totalSegments = segmentList.length;

  // Adjust the first segment by removing the leading 'R'
  // totalSegments will always be at least 1 for any string input.
  const firstSegmentModified = segmentList[0].slice(1);
  segmentList[0] = firstSegmentModified;

  // Adjust the last segment by removing the trailing 'L'
  // Handle the case where there's only one segment (it's both first and last)
  if (totalSegments > 1) {
    const lastSegmentModified = segmentList[totalSegments - 1].slice(0, -1);
    segmentList[totalSegments - 1] = lastSegmentModified;
  } else {
    // If only one segment, apply the second slice operation to the same element
    segmentList[0] = segmentList[0].slice(0, -1);
  }

  const resultArray = [];

  // Iterate through each processed segment using a for...of loop
  for (const currentSegment of segmentList) {
    const segmentLength = currentSegment.length;

    // Iterate through characters within the current segment
    for (let charIndex = 0; charIndex < segmentLength; charIndex++) {
      // Determine if the current position is an 'RL' transition point
      const isTransitionPoint = (charIndex > 0) &&
                                (currentSegment[charIndex - 1] === "R") &&
                                (currentSegment[charIndex] === "L");

      if (isTransitionPoint) {
        // If it's an 'RL' transition, remove the previously added '0'
        resultArray.pop();

        const rightCount = charIndex; // Number of 'R's before the 'L'
        const leftCount = segmentLength - charIndex; // Number of 'L's from the 'L' onwards

        // Calculate parity flags
        const parityFlagA = (rightCount > leftCount) ? 0 : 1; // 0 if R_count > L_count, 1 otherwise
        
        const minCount = Math.min(rightCount, leftCount);
        const isMinCountEven = (minCount % 2 === 0);
        const parityFlagB = isMinCountEven ? 0 : 1; // 0 if min_count is even, 1 if odd

        const finalParity = parityFlagA ^ parityFlagB; // XOR operation to combine parities

        let valueToPush1, valueToPush2; // Temporary variables for the results

        // Pre-calculate common length divisions
        const halfLength = segmentLength / 2;
        const halfLengthPlusOne = (segmentLength + 1) / 2;
        const halfLengthMinusOne = (segmentLength - 1) / 2;

        // Determine values to push based on segment length parity and final parity flag
        if (segmentLength % 2 === 0) {
          valueToPush1 = halfLength;
          valueToPush2 = halfLength;
        } else {
          if (finalParity === 0) {
            valueToPush1 = halfLengthPlusOne;
            valueToPush2 = halfLengthMinusOne;
          } else {
            valueToPush1 = halfLengthMinusOne;
            valueToPush2 = halfLengthPlusOne;
          }
        }
        resultArray.push(valueToPush1);
        resultArray.push(valueToPush2);
      } else {
        // If not a transition point, push a zero
        resultArray.push(0);
      }
    }
  }

  // Output the final array elements joined by spaces
  console.log(resultArray.join(" "));
}

// This line should not be modified (standard input/output handling)
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
