"use strict";

const parseInputData = (rawInputString) => {
  const cleanedInput = rawInputString.trim();
  const lines = cleanedInput.split(/\n+/);

  const elementCount = parseInt(lines[0], 10);
  const valueArray = lines[1].split(/\s+/).map(s => parseInt(s, 10));

  return {
    count: elementCount,
    data: valueArray
  };
};

(function(inputSource){
  const processedInput = parseInputData(inputSource);
  const N = processedInput.count;
  const A = processedInput.data;

  let currentAccumulatedValue = A[N - 1];

  for (let loopIdx = 0; loopIdx < (N - 1) / 2; loopIdx++) {
    const termToSubtract = A[2 * loopIdx];
    const termToAdd = A[2 * loopIdx + 1];
    
    const netAdjustment = termToAdd - termToSubtract;
    currentAccumulatedValue += netAdjustment;
  }

  const finalSequence = new Array(N);
  finalSequence[N - 1] = currentAccumulatedValue;

  for (let k = N - 2; k >= 0; k--) {
    const subsequentElementValue = finalSequence[k + 1];
    finalSequence[k] = (2 * A[k]) - subsequentElementValue;
  }

  console.log(finalSequence.join(" "));

})(require("fs").readFileSync("/dev/stdin","utf8"));
