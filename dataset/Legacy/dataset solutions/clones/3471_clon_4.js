let valueContainer;

function processIteration(currentValues, iterationNumber) {
  const [firstVal, secondVal, limitVal] = currentValues;
  
  const operationIndices = (iterationNumber % 2 === 1) ? [0, 1] : [1, 0];
  const sourceIdx = operationIndices[0];
  const targetIdx = operationIndices[1];

  let sourceOperand = currentValues[sourceIdx];
  
  let transformedSource = (sourceOperand - (sourceOperand & 1)) >> 1;
  
  let nextState = [...currentValues]; 
  nextState[sourceIdx] = transformedSource;
  nextState[targetIdx] += transformedSource;
  
  return nextState;
}

function processInputData(rawData) {
    valueContainer = rawData.split("\n")[0].split(' ').map(Number);
    
    const iterationLimit = valueContainer[2];
    
    const finalState = Array.from({ length: iterationLimit }, (_, idx) => idx + 1)
                             .reduce((accumulatedValues, currentIterationNumber) => {
                                 return processIteration(accumulatedValues, currentIterationNumber);
                             }, valueContainer);
    
    console.log('%d %d', finalState[0], finalState[1]);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
