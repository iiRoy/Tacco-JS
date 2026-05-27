const parseNumericParameters = (paramStringArray) => {
  const [firstValue, secondValue] = paramStringArray.map(s => parseInt(s, 10));
  return { arrayLength: firstValue, divisor: secondValue };
};

const evaluateModuloCondition = (currentSumValue, divisorValue, expectedRemainder) => {
  return currentSumValue % divisorValue === expectedRemainder;
};

function processInputData(rawInputContent) {
  const cleanedInputContent = rawInputContent.trim();
  const inputLines = cleanedInputContent.split('\n');

  const parameterLineParts = inputLines[0].split(' ');
  const { arrayLength: N_val, divisor: K_val } = parseNumericParameters(parameterLineParts);
  
  const numberSequence = inputLines[1].split(' ').map(str => parseInt(str, 10));
  let validSubarrayCount = 0;
  
  const initialRemainderForSingleElement = 1;

  for (let outerLoopIndex = 0; outerLoopIndex < N_val; outerLoopIndex++) {
    let currentRunningSum = numberSequence[outerLoopIndex];
    
    // Check condition for the subarray starting at outerLoopIndex with length 1
    if (evaluateModuloCondition(currentRunningSum, K_val, initialRemainderForSingleElement)) {
      validSubarrayCount++;
    }

    // Extend the subarray by adding subsequent elements
    const elementsRemainingAfterCurrent = N_val - (outerLoopIndex + 1);
    for (let innerLoopOffset = 0; innerLoopOffset < elementsRemainingAfterCurrent; innerLoopOffset++) {
      const nextElementIndex = outerLoopIndex + 1 + innerLoopOffset;
      currentRunningSum += numberSequence[nextElementIndex];
      
      const currentSubarrayTotalLength = innerLoopOffset + 2; // Length of subarray (original j+1)
      const requiredModuloResult = currentSubarrayTotalLength;
      
      if (evaluateModuloCondition(currentRunningSum, K_val, requiredModuloResult)) {
        validSubarrayCount++;
      }
    }
  }
  
  console.log(validSubarrayCount);
}

const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileContents = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
processInputData(fileContents);
