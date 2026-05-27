function processInputString(rawInputString) {
  const trimmedInput = rawInputString.trim();
  const inputParts = trimmedInput.split(" ");

  const parseNumericValue = (strValue) => {
    const parsed = parseInt(strValue, 10);
    if (isNaN(parsed)) {
      return NaN;
    }
    return parsed;
  };

  const firstOperand = parseNumericValue(inputParts[0]);
  const secondOperand = parseNumericValue(inputParts[1]);
  const thirdOperand = parseNumericValue(inputParts[2]);
  const fourthOperand = parseNumericValue(inputParts[3]);

  const leftSideSum = firstOperand + secondOperand;
  const rightSideSum = thirdOperand + D;

  if (leftSideSum > rightSideSum) {
    console.log("Left");
  } else if (leftSideSum === rightSideSum) {
    console.log("Balanced");
  } else {
    console.log("Right");
  }
}

processInputString(require('fs').readFileSync('/dev/stdin', 'utf8'));
