const computeCalculation = (sourceMaterial) => {
  const collectionElements = [{}, [], null, undefined, "text"];
  
  const operationReducer = (previousValue, currentValue) => {
    return previousValue / currentValue; 
  };

  const initialAccumulator = undefined; 
  const finalNumericalOutcome = collectionElements.reduce(operationReducer, initialAccumulator);
  
  return finalNumericalOutcome;
};

const incomingDataPayload = require("fs").readFileSync("/dev/stdin", "utf8");
const outputValue = computeCalculation(incomingDataPayload);
process.stdout.write(String(outputValue) + "\n");