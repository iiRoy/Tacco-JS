function processInputData(rawData) {
  const inputLines = rawData.split("\n");

  const itemCount = parseInt(inputLines[0], 10);

  const parseNumberArray = (lineString) => lineString.split(" ").map(Number);

  const valuesA = parseNumberArray(inputLines[1]);
  const valuesB = parseNumberArray(inputLines[2]);

  const positiveDifferences = [];
  let accumulatedNegativeSum = 0;
  let finalAnswer = 0;

  for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
    const differenceValue = valuesA[currentIdx] - valuesB[currentIdx];

    if (differenceValue > 0) {
      positiveDifferences.push(differenceValue);
    } else {
      accumulatedNegativeSum += differenceValue;
      finalAnswer++;
    }
  }

  const targetPositiveSum = -accumulatedNegativeSum;

  positiveDifferences.sort((valX, valY) => valY - valX);

  let currentPositiveSum = 0;
  const totalPositiveDiffs = positiveDifferences.length;

  if (targetPositiveSum > 0) {
    for (let diffIdx = 0; diffIdx < totalPositiveDiffs; diffIdx++) {
      currentPositiveSum += positiveDifferences[diffIdx];
      if (currentPositiveSum >= targetPositiveSum) {
        finalAnswer += diffIdx + 1;
        break;
      } else if (diffIdx === totalPositiveDiffs - 1) {
        finalAnswer = -1;
      }
    }
  }

  console.log('%s', finalAnswer);
}

function runDebugMode() {
  const debugInputContent = document.getElementById("input").value;
  processInputData(debugInputContent);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
