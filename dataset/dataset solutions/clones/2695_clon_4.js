const processNumericPair = (sourceData) => {
  const digitPattern = /(-?\d+)\s+(-?\d+)/;
  const extractedValues = sourceData.match(digitPattern);
  const primaryOperand = Number(extractedValues[1]);
  const secondaryOperand = Number(extractedValues[2]);

  const totalSum = primaryOperand + secondaryOperand;
  
  const isSumEven = (totalSum & 1) === 0;

  const extentDifference = primaryOperand > secondaryOperand ? primaryOperand - secondaryOperand : secondaryOperand - primaryOperand;

  const candidatePosition = totalSum / 2;

  const isValidSolution = isSumEven && candidatePosition >= 0 && candidatePosition < extentDifference;

  return isValidSolution ? candidatePosition : "IMPOSSIBLE";
};

((dataAcquirer) => {
  const contentPayload = dataAcquirer("utf8");
  const computedResult = processNumericPair(contentPayload);
  process.stdout.write(String(computedResult) + '\n');
})(require("fs").readFileSync.bind(null, "/dev/stdin"));