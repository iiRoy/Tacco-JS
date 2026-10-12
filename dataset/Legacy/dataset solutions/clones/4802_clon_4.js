const processInput = (rawText) => {
  const [firstOperand, operatorSymbol, secondOperand] = rawText.split(" ");

  const finalOutcome = (operatorSymbol === "+")
    ? (firstOperand + secondOperand)
    : (firstOperand - secondOperand);
  
  console.log(finalOutcome);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
