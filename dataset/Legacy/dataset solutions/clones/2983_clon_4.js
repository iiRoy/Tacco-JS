"use strict";
function ProcessInput(rawData) {
  const lineSegments = rawData.split('\n');
  const initialCount = parseInt(lineSegments.shift()); 
  
  let accumulatedABs = 0;
  let suffixAStrings = 0;
  let prefixBStrings = 0;
  let hasBothEndsString = false;

  for (const currentSegment of lineSegments) {
    let segmentABCount = 0;
    let searchIndex = currentSegment.indexOf('AB');
    while (searchIndex !== -1) {
      segmentABCount++;
      searchIndex = currentSegment.indexOf('AB', searchIndex + 1);
    }
    accumulatedABs += segmentABCount;
    console.log(`count: ${accumulatedABs}`);

    const beginsWithB = currentSegment[0] === 'B';
    const concludesWithA = currentSegment[currentSegment.length - 1] === 'A';

    if (beginsWithB) {
      prefixBStrings++;
    }
    if (concludesWithA) {
      suffixAStrings++;
    }
    if (beginsWithB && concludesWithA) {
      hasBothEndsString = true;
    }
  }

  let finalResult = accumulatedABs;
  finalResult += Math.min(suffixAStrings, prefixBStrings);
  finalResult += hasBothEndsString ? -1 : 0;

  console.log(finalResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
