function executeProcessing(rawInputString) {
  const inputLines = rawInputString.split('\n');
  const RADIX_DECIMAL = 10;

  const elementCount = parseInt(inputLines[0], RADIX_DECIMAL);

  const dataLineString = inputLines[1];
  let numericData = dataLineString.split(' ').map(strNum => parseInt(strNum, RADIX_DECIMAL));
  
  let resultValue = 0;
  
  numericData.sort((firstVal, secondVal) => firstVal - secondVal);
  
  if (elementCount === 1) {
    resultValue = numericData[1];
  } else {
    const loopUpperBound = (2 * elementCount) - 1;
    for(let loopIndex = elementCount; loopIndex <= loopUpperBound; loopIndex++) {
      resultValue += numericData[loopIndex];
    }
  }
  
  console.log(resultValue);
}

executeProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));
