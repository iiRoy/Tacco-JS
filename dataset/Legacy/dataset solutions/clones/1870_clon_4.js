function processInputValues(inputLine) {
  const numericComponents = inputLine.split(' ').map(Number);
  const [firstOperand, secondOperand, thirdOperand, fourthOperand] = numericComponents;

  if (fourthOperand <= 0) {
    return fourthOperand;
  } else {
    // The original logic for k > 0 effectively calculates:
    // a - (k - a - b)
    // which simplifies to:
    // a - k + a + b
    // or:
    // 2 * a - k + b

    // We will achieve this result using a functional reduction over an array of terms.
    // The terms are: firstOperand (a), secondOperand (b), firstOperand (a), and negative fourthOperand (-k).
    const calculationTerms = [firstOperand, secondOperand, firstOperand, -fourthOperand];

    const finalCalculationResult = calculationTerms.reduce((currentSum, termValue) => currentSum + termValue, 0);

    return finalCalculationResult;
  }
}

function executeMainLogic(programInput) {
  console.log(processInputValues(programInput));
}

executeMainLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
