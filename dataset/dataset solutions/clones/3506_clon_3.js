function processInputData(rawInputContent) {
  const firstLineOfInput = rawInputContent.split('\n')[0];
  let currentNumberString = String(firstLineOfInput);

  const areAllDigitsIdentical = (numStr) => {
    if (numStr.length === 0) {
      return true;
    }
    const initialChar = numStr[0];
    for (let charIndex = 1; charIndex < numStr.length; charIndex++) {
      if (initialChar !== numStr[charIndex]) {
        return false;
      }
    }
    return true;
  };

  let processingComplete = false;

  mainProcessingLoop: while (!processingComplete) {
    if (areAllDigitsIdentical(currentNumberString)) {
      console.log(currentNumberString);
      processingComplete = true;
    } else {
      const numericValue = parseFloat(currentNumberString);
      const nextNumericValue = numericValue + 1;
      currentNumberString = String(nextNumericValue);
    }
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
