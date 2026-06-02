function processInput(initialStr) {
  const computeDigitSum = (charArray) => {
    let currentSum = 0;
    for (let k = 0; k < charArray.length; k++) {
      const digitChar = charArray[k];
      currentSum += parseInt(digitChar, 10);
    }
    return currentSum;
  };

  const stringRepresentation = initialStr.toString();
  const digitCharacters = stringRepresentation.split('');
  const fullNumber = parseInt(stringRepresentation, 10);

  const digitTotal = computeDigitSum(digitCharacters);

  const remainderCheck = fullNumber % digitTotal;

  if (remainderCheck === 0) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
