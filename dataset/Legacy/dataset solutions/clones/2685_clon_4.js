function processInputData(rawData) {
  "use strict";
  const processedInputString = rawData;
  const separatedSegments = processedInputString.split("LR").map(segmentPart => {
    return "R" + segmentPart + "L";
  });

  const segmentCount = separatedSegments.length;
  separatedSegments[0] = separatedSegments[0].substring(1);
  separatedSegments[segmentCount - 1] = separatedSegments[segmentCount - 1].substring(0, separatedSegments[segmentCount - 1].length - 1);

  const finalCounts = separatedSegments.flatMap(currentSegment => {
    const segmentLength = currentSegment.length;
    const boundaryPosition = currentSegment.indexOf("RL");

    if (boundaryPosition === -1) {
      return Array(segmentLength).fill(0);
    } else {
      const segmentResults = Array(segmentLength).fill(0);
      let countAtRPosition = 0; // Represents people ending at the 'R' side of the boundary (index `boundaryPosition`)
      let countAtLPosition = 0; // Represents people ending at the 'L' side of the boundary (index `boundaryPosition + 1`)

      // Calculate distribution for people starting on the left side of the 'RL' boundary
      // These people are at indices 0 through `boundaryPosition` (inclusive)
      for (let p = 0; p <= boundaryPosition; p++) {
        // If starting position 'p' has the same parity as the 'R' position (`boundaryPosition`),
        // they end up at the 'R' position.
        if ((p % 2) === (boundaryPosition % 2)) {
          countAtRPosition++;
        } else {
          // Otherwise, they end up at the 'L' position.
          countAtLPosition++;
        }
      }

      // Calculate distribution for people starting on the right side of the 'RL' boundary
      // These people are at indices `boundaryPosition + 1` through `segmentLength - 1` (inclusive)
      for (let p = boundaryPosition + 1; p < segmentLength; p++) {
        // If starting position 'p' has the same parity as the 'L' position (`boundaryPosition + 1`),
        // they end up at the 'L' position.
        if ((p % 2) === ((boundaryPosition + 1) % 2)) {
          countAtLPosition++;
        } else {
          // Otherwise, they end up at the 'R' position.
          countAtRPosition++;
        }
      }

      segmentResults[boundaryPosition] = countAtRPosition;
      segmentResults[boundaryPosition + 1] = countAtLPosition;
      return segmentResults;
    }
  });

  console.log(finalCounts.join(" ") + "\n");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
