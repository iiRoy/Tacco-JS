function ProcessInput(rawData) {
  rawData = rawData.split("\n");
  let elementCount = Number.parseInt(rawData[0]);
  let dataElements = rawData[1].split(" ").map(item => Number.parseInt(item));
  let finalResult = 0;
  let memoTable = new Array(elementCount);
  let prefixSums = new Array(elementCount);
  prefixSums[0] = dataElements[0];

  // Initialize the DP table and pre-calculate cumulative sums
  for (let idx1 = 0; idx1 < elementCount; idx1++) {
    let rowInitializer = new Array(elementCount).fill(0);
    memoTable[idx1] = rowInitializer;

    if (idx1 > 0) {
      prefixSums[idx1] = prefixSums[idx1 - 1] + dataElements[idx1];
    }
  }

  // Populate the memoization table using a bottom-up approach
  for (let subproblemLength = 1; subproblemLength < elementCount; subproblemLength++) {
    for (let idx1 = 0, idx2 = subproblemLength; idx1 < elementCount && idx2 < elementCount; idx1++, idx2++) {
      let currentMinVal = Number.POSITIVE_INFINITY;

      // Determine the optimal split point for the current range
      for (let splitPoint = idx1; splitPoint < idx2; splitPoint++) {
        if (idx1 !== 0) {
          currentMinVal = Math.min(currentMinVal, memoTable[idx1][splitPoint] + memoTable[splitPoint + 1][idx2] + prefixSums[idx2] - prefixSums[idx1 - 1]);
        } else {
          currentMinVal = Math.min(currentMinVal, memoTable[idx1][splitPoint] + memoTable[splitPoint + 1][idx2] + prefixSums[idx2]);
        }
      }
      memoTable[idx1][idx2] = currentMinVal;
    }
  }
  finalResult = memoTable[0][elementCount - 1];

  console.log('%s', finalResult);
  return finalResult;
}

// Utility for validating solutions in a testing environment
function TestSolution(testCaseId) {
  let rawInputData = document.getElementById("input" + testCaseId).value;
  let computedAnswer = ProcessInput(rawInputData);
  let testOutcome = "FAIL";

  if (computedAnswer == document.getElementById("output" + testCaseId).value.split("\n")[0]) {
    testOutcome = "PASS";
  }
  document.getElementById("result" + testCaseId).innerHTML = testOutcome;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));