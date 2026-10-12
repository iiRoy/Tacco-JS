function ProcessInput(rawData) {
  const inputLines = rawData.split("\n");
  
  const elementCount = parseInt(inputLines[0], 10);
  const valueArray = inputLines[1].split(" ").map(valStr => parseInt(valStr, 10));
  
  let minTotalCost = 0;
  
  const memoTable = new Array(elementCount);
  for (let rowIdx = 0; rowIdx < elementCount; rowIdx++) {
    memoTable[rowIdx] = new Array(elementCount).fill(0);
  }

  const prefixSums = new Array(elementCount);
  prefixSums[0] = valueArray[0];
  for (let currentIdx = 1; currentIdx < elementCount; currentIdx++) {
    prefixSums[currentIdx] = prefixSums[currentIdx - 1] + valueArray[currentIdx];
  }

  const getSegmentSum = (start, end) => {
    if (start === 0) {
      return prefixSums[end];
    } else {
      return prefixSums[end] - prefixSums[start - 1];
    }
  };

  const VERY_LARGE_NUMBER = 1e19; // Using 10^19 as in the original intent

  for (let subproblemSize = 1; subproblemSize < elementCount; subproblemSize++) {
    for (let startIdx = 0; startIdx < elementCount - subproblemSize; startIdx++) {
      const endIdx = startIdx + subproblemSize;
      
      let currentMinCost = VERY_LARGE_NUMBER;
      
      for (let splitPoint = startIdx; splitPoint < endIdx; splitPoint++) {
        const costFromLeftSubproblem = memoTable[startIdx][splitPoint];
        const costFromRightSubproblem = memoTable[splitPoint + 1][endIdx];
        const currentSegmentSum = getSegmentSum(startIdx, endIdx);

        const combinedSubproblemCost = costFromLeftSubproblem + costFromRightSubproblem + currentSegmentSum;
        currentMinCost = Math.min(currentMinCost, combinedSubproblemCost);
      }
      memoTable[startIdx][endIdx] = currentMinCost;
    }
  }
  
  minTotalCost = memoTable[0][elementCount - 1];

  console.log('%s', minTotalCost);
  return minTotalCost;
}

function verifySolution(testCaseIdentifier){
  const testInputData = document.getElementById("input" + testCaseIdentifier).value;
  const computedAnswer = ProcessInput(testInputData);
  let verificationStatus = "WA";
  const expectedOutputData = document.getElementById("output" + testCaseIdentifier).value.split("\n")[0];
  if(computedAnswer.toString() === expectedOutputData){
    verificationStatus = "AC";
  }
  document.getElementById("result" + testCaseIdentifier).innerHTML = verificationStatus;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
