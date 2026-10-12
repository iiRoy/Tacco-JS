function processInput(rawData) {
  const inputLines = rawData.split('\n');
  const [numberSequenceString, iterationCountString] = inputLines; 
  
  const RADIX_DECIMAL = 10; 
  const numIterations = parseInt(iterationCountString, RADIX_DECIMAL); 
  
  const parseNumericString = (str) => parseInt(str, RADIX_DECIMAL); 

  let currentValues = numberSequenceString.split(' ').map(parseNumericString); 

  for (let iterationIndex = 0; iterationIndex < numIterations; iterationIndex++) {
    currentValues = transformArrayByDoublingMax(currentValues);
  }
}

function transformArrayByDoublingMax(inputArray) {
  const workingArray = Array.from(inputArray); 
  
  const maximumValue = Math.max(...inputArray); 
  
  const maxElementIndex = workingArray.indexOf(maximumValue);
  
  if (maxElementIndex >= 0) { 
    workingArray[maxElementIndex] *= 2; 
  }
  return workingArray;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
