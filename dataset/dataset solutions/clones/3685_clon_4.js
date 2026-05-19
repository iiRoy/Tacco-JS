function computeOutcome(rawInputString) {
  const numericComponents = rawInputString.match(/\d+/g).map(Number);

  const [firstValue, secondValue, thirdValue] = numericComponents;

  const adjustedSecondValue = secondValue - 1;
  const conditionalMultiplier = [1, 2][+!!thirdValue];

  const productTermA = adjustedSecondValue;
  const productTermB = firstValue - thirdValue;
  const productTermC = conditionalMultiplier;

  const divisorTerm = Math.pow(firstValue, 2);

  const finalResult = (productTermA * productTermB * productTermC) / divisorTerm;

  console.log(finalResult);
}

computeOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));
