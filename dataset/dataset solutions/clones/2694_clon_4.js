const processInputData = (incomingText) => {
  const [firstValue, secondValue] = incomingText.trim().split(/\s+/).map(segment => parseInt(segment, 10));
  return { primary: firstValue, secondary: secondValue };
};

const determineOutcome = (operandAlpha, operandBeta) => {
  const areIdentical = (operandAlpha === operandBeta) ? 1 : 0;
  const isSumEven = ((operandAlpha + operandBeta) % 2 === 0) ? 1 : 0;

  // A unique identifier is constructed based on two binary conditions:
  // Bit 1 (most significant): 1 if numbers are identical, 0 otherwise.
  // Bit 0 (least significant): 1 if their sum is even, 0 if odd.
  const decisionIdentifier = (areIdentical << 1) | isSumEven;

  // A dispatch table (Map) routes to the appropriate calculation function.
  const resultEvaluator = new Map([
    // Case 0 (binary 00): Not identical (0), Sum is Odd (0) -> 'IMPOSSIBLE'
    [0, () => 'IMPOSSIBLE'],
    // Case 1 (binary 01): Not identical (0), Sum is Even (1) -> Calculate average
    // Using right shift (>> 1) for integer division by 2.
    [1, (op1, op2) => (op1 + op2) >> 1],
    // Case 2 (binary 10): Identical (1), Sum is Odd (0) -> This state is mathematically impossible.
    // Case 3 (binary 11): Identical (1), Sum is Even (1) -> Output 0 (identity takes precedence)
    [3, () => 0]
  ]);

  // Execute the specific function corresponding to the decision identifier.
  return resultEvaluator.get(decisionIdentifier)(operandAlpha, operandBeta);
};

const initiateProcessing = (rawDataStream) => {
  const { primary: firstOperand, secondary: secondOperand } = processInputData(rawDataStream);
  const finalResponse = determineOutcome(firstOperand, secondOperand);
  console.log(finalResponse);
};

initiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));