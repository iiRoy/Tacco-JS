const fileSystemModule = require('fs');

const acquireSourceContent = (sourceIdentifier) =>
  fileSystemModule.readFileSync(sourceIdentifier, 'utf8');

const transformTextToNumbers = (rawTextData) => {
  const segments = rawTextData.trim().split(' ');
  const [valueA, valueB] = segments.map(Number);
  return { valueA, valueB };
};

const determineHighestCommonFactor = (operandOne, operandTwo) => {
  if (Number.isNaN(operandOne) || Number.isNaN(operandTwo)) {
    return -Infinity;
  }
  if (operandOne === 0 || operandTwo === 0) {
    return -Infinity;
  }

  let currentA = operandOne;
  let currentB = operandTwo;

  while (currentB !== 0) {
    const temporaryValue = currentB;
    currentB = currentA % currentB;
    currentA = temporaryValue;
  }
  return currentA;
};

const orchestrateExecution = () => {
  const dataFromInput = acquireSourceContent('/dev/stdin');
  const { valueA, valueB } = transformTextToNumbers(dataFromInput);
  const outcome = determineHighestCommonFactor(valueA, valueB);
  console.log(outcome);
};

orchestrateExecution();