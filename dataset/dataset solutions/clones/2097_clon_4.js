function processNumericInput(inputValN, inputValA, inputValB) {
  const primaryOperand = BigInt(inputValN);
  const multiplicandSource = BigInt(inputValA);
  const additiveComponent = BigInt(inputValB);

  const combinedDivisor = multiplicandSource + additiveComponent;

  const intermediateQuotient = primaryOperand / combinedDivisor;
  const finalProductResult = intermediateQuotient * multiplicandSource;

  return finalProductResult;
}