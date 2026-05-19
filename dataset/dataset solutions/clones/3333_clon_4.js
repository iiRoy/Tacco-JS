'use strict';
(function(rawInputString){
  const processedData = rawInputString.trim().split(/\s+/).map(val => parseInt(val, 10));
  const totalCount = processedData.shift();
  const numberSequence = processedData;

  const memoizedResults = new Map();

  function computeOptimalDifference(segmentLength, segmentStart) {
    if (segmentLength === 0) {
      return 0;
    }

    const memoKey = `${segmentLength},${segmentStart}`;
    if (memoizedResults.has(memoKey)) {
      return memoizedResults.get(memoKey);
    }

    // This implements the exact recurrence from the original code:
    // dp[i][j] = Math.max(A[i+j-1] - dp[i-1][j], A[j] - dp[i-1][j]);
    // where 'i' is segmentLength, 'j' is segmentStart.
    // A[i+j-1] corresponds to numberSequence[segmentStart + segmentLength - 1]
    // A[j] corresponds to numberSequence[segmentStart]
    // dp[i-1][j] corresponds to computeOptimalDifference(segmentLength - 1, segmentStart)

    const valueIfRightPicked = numberSequence[segmentStart + segmentLength - 1] - computeOptimalDifference(segmentLength - 1, segmentStart);
    const valueIfLeftPicked = numberSequence[segmentStart] - computeOptimalDifference(segmentLength - 1, segmentStart);

    const currentMaxDiff = Math.max(valueIfRightPicked, valueIfLeftPicked);
    memoizedResults.set(memoKey, currentMaxDiff);
    return currentMaxDiff;
  }

  const finalResult = computeOptimalDifference(totalCount, 0);
  console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));
