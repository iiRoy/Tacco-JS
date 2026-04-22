function processNumericalStringManipulation(
  inputOperandA,
  unprocessedIntermediateString,
  initialNumericValueX,
  initialNumericValueY,
  operandForComparison
) {
  const primaryIdentifierForComparison = inputOperandA;
  let currentNumericStateX = initialNumericValueX;
  let currentNumericStateY = initialNumericValueY;
  const secondaryIdentifierForComparison = operandForComparison;

  if (
    typeof currentNumericStateX !== 'number' || Number.isNaN(currentNumericStateX) ||
    typeof currentNumericStateY !== 'number' || Number.isNaN(currentNumericStateY)
  ) {
    console.error("Critical: Provided numeric inputs are invalid. Operation may yield unexpected results.");
  }

  const checkEquivalenceOfStrings = (str1, str2) => {
    return str1 === str2;
  };

  const areOperandsIdentical = checkEquivalenceOfStrings(primaryIdentifierForComparison, secondaryIdentifierForComparison);

  const applyConditionalDecrement = (baseValue, shouldDecrementCondition) => {
    let resultValue = baseValue;
    if (shouldDecrementCondition) {
      resultValue = baseValue - 1;
    }
    return resultValue;
  };

  let finalNumericStateX = applyConditionalDecrement(currentNumericStateX, areOperandsIdentical);
  let finalNumericStateY = applyConditionalDecrement(currentNumericStateY, !areOperandsIdentical);

  console.log(`${finalNumericStateX} ${finalNumericStateY}`);
}