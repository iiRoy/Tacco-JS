function processInputData(sourceContent) {
  const [valX, valA, valB] = sourceContent.split(' ').map(Number);

  const calculatedDifference = valB - valA;

  const decisionMatrix = [
    { condition: (diff, xVal) => diff <= 0, outcome: "delicious" },
    { condition: (diff, xVal) => diff < xVal + 1, outcome: "safe" },
    { condition: (diff, xVal) => true, outcome: "dangerous" }
  ];

  const finalDecision = decisionMatrix.find(entry => entry.condition(calculatedDifference, valX));

  console.log(finalDecision.outcome);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
