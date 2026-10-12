function ProcessInputAndCalculate(inputData) {
  const [firstLineContent] = inputData.split('\n');
  const [valueToConvert, conversionBase] = firstLineContent.split(' ').map(Number);

  function determineRepresentationLength(numberValue, baseValue) {
    if (numberValue === 0) {
      return 1;
    }
    let countOfDigits = 0;
    let currentWorkingNumber = numberValue;
    while (currentWorkingNumber > 0) {
      currentWorkingNumber = Math.floor(currentWorkingNumber / baseValue);
      countOfDigits++;
    }
    return countOfDigits;
  }

  console.log(determineRepresentationLength(valueToConvert, conversionBase));
}

ProcessInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
