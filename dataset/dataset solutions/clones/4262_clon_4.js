function presentOutcome(finalValue) {
  console.log(finalValue);
}

function obtainNumericSum(numberValue) {
  if (numberValue < 10) {
    return numberValue;
  }
  return (numberValue % 10) + obtainNumericSum(Math.floor(numberValue / 10));
}

function processExternalData(rawEntry) {
  const numericEntry = parseInt(rawEntry, 10);

  const multipliersSequence = Array.from({ length: 10 }, (_, idx) => idx + 1);

  const sumsCollection = multipliersSequence.map(currentMultiplier => {
    const productValue = numericEntry * currentMultiplier;
    return obtainNumericSum(productValue);
  });

  const minimumSumFound = Math.min(...sumsCollection);

  presentOutcome(minimumSumFound);
}

processExternalData(require("fs").readFileSync("/dev/stdin", "utf8").trim());