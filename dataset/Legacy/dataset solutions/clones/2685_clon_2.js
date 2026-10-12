function ProcessInput(rawData) {
  // Enable strict mode for cleaner code execution
  "use strict";

  // Assign the raw input to a more descriptive variable
  const inputString = rawData;

  // Split the input string by "LR" and wrap each part with "R" and "L"
  // This effectively creates segments that start with 'R' and end with 'L'
  const segments = inputString.split("LR").map(segmentPart => {
    return "R" + segmentPart + "L";
  });

  // Get the total number of segments created
  const totalSegments = segments.length;

  // Adjust the first segment: remove the leading 'R' if it was added
  // This handles the case where the original string didn't start with 'R'
  segments[0] = segments[0].slice(1);

  // Adjust the last segment: remove the trailing 'L' if it was added
  // This handles the case where the original string didn't end with 'L'
  segments[totalSegments - 1] = segments[totalSegments - 1].slice(0, -1);

  // Initialize an array to store the calculated results
  const resultArray = [];

  // Iterate over each processed segment
  segments.forEach(currentSegment => {
    // Determine the length of the current segment
    const segmentLength = currentSegment.length;

    // Loop through each character position within the current segment
    for (let idx = 0; idx < segmentLength; idx++) {
      // Check for the "RL" boundary condition:
      // - Not at the very beginning of the segment (idx > 0)
      // - The character before the current position is 'R'
      // - The character at the current position is 'L'
      if (idx !== 0 && currentSegment[idx - 1] === "R" && currentSegment[idx] === "L") {
        // If an "RL" boundary is found, the previous '0' placeholder is incorrect, so remove it
        resultArray.pop();

        // Calculate the number of 'R's (right-moving characters)
        const rightCount = idx;
        // Calculate the number of 'L's (left-moving characters)
        const leftCount = segmentLength - idx;

        // Determine parity 'a': 0 if rightCount is greater, 1 otherwise
        const parityA = (rightCount > leftCount) ? 0 : 1;
        // Determine parity 'b': 0 if the minimum of counts is even, 1 otherwise
        const parityB = (Math.min(rightCount, leftCount) % 2 == 0) ? 0 : 1;
        // Calculate final parity 'c' using XOR operation
        const finalParity = parityA ^ parityB;

        // Distribute the segment length based on parity and even/odd length
        if (segmentLength % 2 === 0) {
          // If segment length is even, distribute equally
          resultArray.push(segmentLength / 2);
          resultArray.push(segmentLength / 2);
        } else if (finalParity === 0) {
          // If segment length is odd and final parity is 0
          resultArray.push((segmentLength + 1) / 2);
          resultArray.push((segmentLength - 1) / 2);
        } else {
          // If segment length is odd and final parity is 1
          resultArray.push((segmentLength - 1) / 2);
          resultArray.push((segmentLength + 1) / 2);
        }
      } else {
        // If no "RL" boundary is found at this position, push a placeholder zero
        resultArray.push(0);
      }
    }
  });

  // Join the results with spaces and add a newline character at the end
  console.log(resultArray.join(" ") + "\n");
}

// This section handles reading input from standard input and calling the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
