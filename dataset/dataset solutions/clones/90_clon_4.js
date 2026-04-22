const ioUtil = require('fs');

const findGreaterValue = (firstOperand, secondOperand) => firstOperand > secondOperand ? firstOperand : secondOperand;

const deriveMaxContiguousSum = (numericSequence) => {
  let currentMaxEndingPoint = -1000000;
  let overallMaxEncountered = -1000000;

  numericSequence.forEach(numericItem => {
    currentMaxEndingPoint = findGreaterValue(currentMaxEndingPoint + numericItem, numericItem);
    overallMaxEncountered = findGreaterValue(overallMaxEncountered, currentMaxEndingPoint);
  });

  return overallMaxEncountered;
};

const initiateProcessing = () => {
  const fullContentString = ioUtil.readFileSync('/dev/stdin', 'utf8');
  const linesArray = fullContentString.trim().split('\n');

  let currentLineReference = 0;
  const collectedResults = [];

  while (currentLineReference < linesArray.length) {
    const numberOfElements = Number(linesArray[currentLineReference++]);

    if (numberOfElements === 0) {
      break;
    }

    const currentProblemSequence = [];
    for (let k = 0; k < numberOfElements; k++) {
      currentProblemSequence.push(Number(linesArray[currentLineReference++]));
    }

    collectedResults.push(deriveMaxContiguousSum(currentProblemSequence));
  }

  collectedResults.forEach(finalValue => console.log(finalValue));
};

initiateProcessing();