function prepareSegments(sourceString) {
  const rawParts = sourceString.split("LR");
  const processedSegments = rawParts.map(part => "R" + part + "L");
  const totalSegments = processedSegments.length;

  if (totalSegments > 0) {
    processedSegments[0] = processedSegments[0].slice(1);
    processedSegments[totalSegments - 1] = processedSegments[totalSegments - 1].slice(0, -1);
  }
  return processedSegments;
}

function calculateBoundaryResults(segmentLength, splitIndex) {
  const rightSideCount = splitIndex;
  const leftSideCount = segmentLength - splitIndex;

  const isRightCountGreater = (rightSideCount > leftSideCount);
  const minCountIsEven = (Math.min(rightSideCount, leftSideCount) % 2 === 0);

  const parityA = isRightCountGreater ? 1 : 0;
  const parityB = minCountIsEven ? 0 : 1;
  const finalParity = parityA ^ parityB;

  return {
    right: rightSideCount,
    left: leftSideCount,
    parity: finalParity
  };
}

function processInput(rawData) {
  "use strict";
  const inputString = rawData;
  const segments = prepareSegments(inputString);

  const resultArray = [];

  segments.forEach(currentSegment => {
    const currentSegmentLength = currentSegment.length;
    for (let idx = 0; idx < currentSegmentLength; idx++) {
      const isRLBoundary = (idx > 0 && currentSegment[idx - 1] === "R" && currentSegment[idx] === "L");

      if (isRLBoundary) {
        resultArray.pop();
        const boundaryInfo = calculateBoundaryResults(currentSegmentLength, idx);
        const finalParity = boundaryInfo.parity;

        const halfLengthEven = currentSegmentLength / 2;
        const halfLengthPlusOne = (currentSegmentLength + 1) / 2;
        const halfLengthMinusOne = (currentSegmentLength - 1) / 2;

        if (currentSegmentLength % 2 === 0) {
          resultArray.push(halfLengthEven);
          resultArray.push(halfLengthEven);
        } else if (finalParity === 0) {
          resultArray.push(halfLengthPlusOne);
          resultArray.push(halfLengthMinusOne);
        } else {
          resultArray.push(halfLengthMinusOne);
          resultArray.push(halfLengthPlusOne);
        }
      } else {
        resultArray.push(0);
      }
    }
  });
  console.log(resultArray.join(" ") + "\n");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
