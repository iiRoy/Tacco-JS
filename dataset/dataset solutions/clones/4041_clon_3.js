function parseIntegerArray(lineString) {
  return lineString.split(" ").map(Number);
}

function processInputData(rawData) {
  const lines = rawData.split("\n");
  const itemCount = Number(lines[0]);

  const arrayA = Array.from({ length: itemCount }, () => 0);
  const arrayB = Array.from({ length: itemCount }, () => 0);

  const tempArrayAValues = parseIntegerArray(lines[1]);
  const tempArrayBValues = parseIntegerArray(lines[2]);

  let totalA = 0;
  let totalB = 0;
  let totalAbsoluteDifference = 0;
  let positiveDifferenceSum = 0;
  let negativeDifferenceSum = 0;

  for (let idx = 0; idx < itemCount; idx++) {
    const currentAValue = tempArrayAValues[idx];
    const currentBValue = tempArrayBValues[idx];

    arrayA[idx] = currentAValue;
    totalA += currentAValue;

    arrayB[idx] = currentBValue;
    totalB += currentBValue;

    const differenceAB = currentAValue - currentBValue;
    const differenceBA = currentBValue - currentAValue;

    totalAbsoluteDifference += Math.abs(differenceAB);
    positiveDifferenceSum += Math.max(0, differenceBA);
    negativeDifferenceSum += Math.max(0, differenceAB);
  }

  let resultString = "No";

  const sumDifference = totalB - totalA;

  const checkSumOrder = totalA <= totalB;
  const checkAbsDiffBound = totalAbsoluteDifference <= sumDifference * 3;
  const checkPosDiffBound = positiveDifferenceSum <= sumDifference * 2;
  const checkNegDiffBound = negativeDifferenceSum <= sumDifference;

  let checkRatio = false;
  if (negativeDifferenceSum === 0) {
    checkRatio = false;
  } else {
    checkRatio = positiveDifferenceSum / negativeDifferenceSum <= 2;
  }

  if (checkSumOrder && checkAbsDiffBound && checkPosDiffBound && checkNegDiffBound && checkRatio) {
    resultString = "Yes";
  }

  console.log('%s', resultString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
