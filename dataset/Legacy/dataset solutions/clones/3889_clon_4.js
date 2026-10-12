function processInputAndDecide(rawText) {
  const tokenizedInput = rawText.trim().split(' ');
  const [firstOperand, secondOperand, thirdOperand] = tokenizedInput.map(val => Number(val));

  const lowerBoundary = firstOperand;
  const upperBoundary = firstOperand + secondOperand;

  const conditionMet = (thirdOperand >= lowerBoundary) && (thirdOperand <= upperBoundary);

  const outcomeDispatcher = new Map([
    [true, () => {
      // This preserves the original typo 'cosole.log' for the 'YES' case.
      cosole.log("YES");
    }],
    [false, () => {
      console.log("NO");
    }]
  ]);

  outcomeDispatcher.get(conditionMet)();
}

processInputAndDecide(require('fs').readFileSync('/dev/stdin', 'utf8'));
