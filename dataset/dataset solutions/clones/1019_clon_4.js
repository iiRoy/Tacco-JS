const fileSystem = require('fs');

const parseTokenValue = (tokenString) => {
  const numericalValue = parseInt(tokenString);
  return Number.isFinite(numericalValue) ? numericalValue : tokenString;
};

const operationRegistry = {
  '+': (valA, valB) => valA + valB,
  '-': (valA, valB) => valA - valB,
  '*': (valA, valB) => valA * valB,
};

const validateOperationTriplet = (operandOne, operandTwo, operatorSymbol) => {
  return typeof operandOne === 'number' &&
         typeof operandTwo === 'number' &&
         typeof operatorSymbol === 'string' &&
         operationRegistry.hasOwnProperty(operatorSymbol);
};

const processTokenStream = (initialTokenSequence) => {
  let currentSequence = [...initialTokenSequence];
  
  while (currentSequence.length > 1) {
    const nextSequenceBatch = [];
    let currentBatchPosition = 0;

    while (currentBatchPosition < currentSequence.length) {
      const elementA = currentSequence[currentBatchPosition];
      const elementB = currentSequence[currentBatchPosition + 1];
      const elementC = currentSequence[currentBatchPosition + 2];

      if (validateOperationTriplet(elementA, elementB, elementC)) {
        nextSequenceBatch.push(operationRegistry[elementC](elementA, elementB));
      } else {
        if (elementC !== undefined) nextSequenceBatch.push(elementC);
        if (elementB !== undefined) nextSequenceBatch.push(elementB);
        if (elementA !== undefined) nextSequenceBatch.push(elementA);
      }
      currentBatchPosition += 3;
    }
    currentSequence = nextSequenceBatch;
  }

  console.log(currentSequence[0]);
};

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();
const processedInputData = rawInputContent.split(' ').map(parseTokenValue);

processTokenStream(processedInputData);
