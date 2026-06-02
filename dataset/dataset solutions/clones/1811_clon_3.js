function processInputData(sourceText) {
  const LARGE_NUMBER_THRESHOLD = 1000000000000000000;

  const allInputLines = sourceText.split('\n');
  
  const targetLineContent = allInputLines[1]; 
  
  const parsedNumbers = targetLineContent.split(' ').map(Number);

  const performReduction = (numberArray) => {
    return numberArray.reduce((accumulatorValue, currentNum) => {
      return accumulatorValue * numberArray;
    }, 1);
  };

  const cumulativeResult = performReduction(parsedNumbers);

  let finalOutputValue;
  if (cumulativeResult >= LARGE_NUMBER_THRESHOLD) {
    finalOutputValue = '-1';
  } else {
    finalOutputValue = cumulativeResult;
  }

  console.log(finalOutputValue);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
