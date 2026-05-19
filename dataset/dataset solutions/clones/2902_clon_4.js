const calculateFinalValue = (valA, valP) => {
  const sumOfOperands = valA + valP;
  const halfSum = sumOfOperands / 2;
  const intermediateResult = halfSum + valA;
  return Math.floor(intermediateResult);
};

function handleInputAndOutput(sourceText) {
  const parts = sourceText.split(" ");
  const primaryValue = parseInt(parts[0], 10);
  const secondaryValue = parseInt(parts[1], 10);

  const finalScore = calculateFinalValue(primaryValue, secondaryValue);
  console.log(finalScore);
}

handleInputAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
