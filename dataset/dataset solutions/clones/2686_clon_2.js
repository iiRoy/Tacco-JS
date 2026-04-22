function ProcessInput(rawData) {
  "use strict";
  // Store the raw input content as a primary text string.
  const textString = rawData;

  // Split the primary string into segments based on the "LR" pattern.
  // Each resulting segment is then wrapped with "R" at the start and "L" at the end.
  const segmentList = textString.split("LR").map( currentSegment => {
    // This mapping function encloses each part with specific characters.
    return "R" + currentSegment + "L";
  });

  // Obtain the total count of segments generated from the input.
  const segmentCount = segmentList.length;

  // Modify the very first segment: remove its initial 'R' character.
  segmentList[0] = segmentList[0].slice(1);
  // Modify the very last segment: remove its final 'L' character.
  segmentList[segmentCount - 1] = segmentList[segmentCount - 1].slice(0, -1);

  // Initialize an array that will accumulate all the calculated output values.
  const finalResults = [];

  // Iterate through each processed segment to calculate its contribution to the final results.
  segmentList.forEach( currentSegment => {
    // Determine the character length of the current segment being processed.
    const segmentLength = currentSegment.length;

    // Loop through each character position within the current segment.
    for ( let idx = 0; idx < segmentLength; idx++ ) {
      // Check for a specific 'RL' transition point within the segment.
      if ( (idx !== 0) && (currentSegment[idx - 1] === "R") && (currentSegment[idx] === "L") ) {
        // If an 'RL' transition is found, remove the last entry from the results.
        finalResults.pop();

        // Calculate the number of 'R' characters leading up to the transition.
        const rightCount = idx;
        // Calculate the number of 'L' characters following the transition.
        const leftCount = segmentLength - idx;

        // Determine a binary flag based on the comparison of 'R' and 'L' counts.
        const parityFlagA = (rightCount > leftCount) ? 0 : 1;
        // Determine another binary flag based on the parity of the minimum count.
        const parityFlagB = (Math.min(rightCount, leftCount) % 2 === 0) ? 0 : 1;
        // Compute an XOR sum of the two parity flags.
        const xorResult = parityFlagA ^ parityFlagB;

        // Apply different distribution logic based on segment length parity and the XOR result.
        if (segmentLength % 2 === 0) {
          // If the segment length is even, distribute values equally.
          finalResults.push(segmentLength / 2);
          finalResults.push(segmentLength / 2);
        } else if (xorResult === 0) {
          // If odd length and XOR result is zero, apply a specific unequal distribution.
          finalResults.push((segmentLength + 1) / 2);
          finalResults.push((segmentLength - 1) / 2);
        } else {
          // Otherwise (odd length and XOR result is one), apply the other unequal distribution.
          finalResults.push((segmentLength - 1) / 2);
          finalResults.push((segmentLength + 1) / 2);
        }
      } else {
        // If no 'RL' transition is found at the current position, add a zero to the results.
        finalResults.push(0);
      }
    }
  });

  // Print the collected results to the console, joined by spaces.
  console.log(finalResults.join(" "));
}

// The following code block is for handling standard input/output and should remain untouched.
ProcessInput( require("fs").readFileSync( "/dev/stdin", "utf8" ) );