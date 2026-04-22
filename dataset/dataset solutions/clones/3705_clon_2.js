function ProcessInput ( sourceData ) {

  const lineSegments = sourceData.split('\n');
  var totalCount = parseInt(lineSegments[0]);
  let numericValues = lineSegments[1].split(' ').map(val => parseInt(val));

  var runningTotal = 0;
  let prefixSums = numericValues.map((val) => {
    runningTotal += val;
    return runningTotal;
  });

  let segmentA = [];
  let segmentB = [];
  let segmentC = [];
  let segmentD = [];

  // This block identifies optimal split points for the left segments of the array.
  for ( var loopIndex = 1, leftBoundary = 0 ; loopIndex < totalCount - 2 ; ++loopIndex ) {
    const currentLeftArray = prefixSums.slice(0, loopIndex + 1);
    const leftArraySum = currentLeftArray[currentLeftArray.length - 1];

    let leftVal1 = currentLeftArray[leftBoundary];
    let leftVal2 = leftArraySum - leftVal1;
    let leftVal1Prev = currentLeftArray[leftBoundary + 1];
    let leftVal2Prev = leftArraySum - leftVal1Prev;

    // Check if shifting the internal boundary to the right improves the balance.
    if ( currentLeftArray.length > 2 && Math.abs(leftVal2Prev - leftVal1Prev) <= Math.abs(leftVal2 - leftVal1) ) {
      ++leftBoundary;
    }

    segmentA.push(currentLeftArray[leftBoundary]);
    segmentB.push(currentLeftArray[currentLeftArray.length - 1] - currentLeftArray[leftBoundary]);
  }

  // This section determines optimal split points for the right segments.
  for ( var loopIndex = totalCount - 2, rightBoundary = 1 ; loopIndex > 1 ; --loopIndex, ++rightBoundary ) {
    const currentRightArray = prefixSums.slice(loopIndex);
    const previousSegmentEnd = prefixSums.slice(loopIndex - 1, loopIndex)[0];
    const rightArraySum = currentRightArray[currentRightArray.length - 1];

    let rightVal1 = rightArraySum - currentRightArray[rightBoundary - 1];
    let rightVal2 = currentRightArray[rightBoundary] - previousSegmentEnd;
    let rightVal1Prev = rightArraySum - currentRightArray[rightBoundary - 2];
    let rightVal2Prev = currentRightArray[rightBoundary - 1] - previousSegmentEnd;

    // Evaluate if moving the internal boundary to the left yields a better balance.
    if ( currentRightArray.length > 2 && Math.abs(rightVal1Prev - rightVal2Prev) <= Math.abs(rightVal1 - rightVal2) ) {
      --rightBoundary;
    }

    segmentC.unshift(currentRightArray[rightBoundary - 1] - previousSegmentEnd);
    segmentD.unshift(rightArraySum - currentRightArray[rightBoundary - 1]);
  }

  var minOverallDifference = -1; // Placeholder for the smallest difference discovered.

  // Final iteration to compute the minimum difference among all four parts.
  for ( var loopIndex = 0 ; loopIndex < segmentA.length ; ++loopIndex ) {
    const currentCalculatedDifference = Math.max(segmentA[loopIndex], segmentB[loopIndex], segmentC[loopIndex], segmentD[loopIndex]) - Math.min(segmentA[loopIndex], segmentB[loopIndex], segmentC[loopIndex], segmentD[loopIndex]);
    if ( minOverallDifference < 0 || currentCalculatedDifference < minOverallDifference ) {
      minOverallDifference = currentCalculatedDifference;
    }
  }

  console.log(minOverallDifference);

}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));