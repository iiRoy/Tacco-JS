const calculateCriterion = (numericInput) => {
  const digitStringArray = Array.from(String(numericInput));
  const sumOfConstituentDigits = digitStringArray.reduce((currentSum, digitChar) => currentSum + parseInt(digitChar, 10), 0);
  return numericInput / sumOfConstituentDigits;
};

const processSequence = (rawInputContent) => {
  const lines = rawInputContent.split('\n');
  const firstNumericLine = lines[0].split(' ');
  const totalIterations = parseInt(firstNumericLine[0], 10);

  const initialSequenceOutput = [1];

  const finalState = Array.from({ length: totalIterations - 1 }, (_, idx) => idx)
    .reduce((currentAccumulator, iterationIndex) => {
      let currentStartingPoint = currentAccumulator.nextSearchValue;
      let bestFoundValue = currentStartingPoint;
      let minimumRatioAchieved = calculateCriterion(bestFoundValue);

      const stringRepresentationOfCurrent = String(currentStartingPoint);
      const digitPositions = Array.from({ length: stringRepresentationOfCurrent.length }, (_, i) => i);

      const modifiedNumberCandidates = digitPositions.map(position => {
        const charArray = stringRepresentationOfCurrent.split('');
        charArray[position] = '9';
        return parseInt(charArray.join(''), 10);
      });

      const allPossibleCandidates = [currentStartingPoint, ...modifiedNumberCandidates];

      for (const candidateValue of allPossibleCandidates) {
        const currentCriterionResult = calculateCriterion(candidateValue);
        if (currentCriterionResult < minimumRatioAchieved) {
          bestFoundValue = candidateValue;
          minimumRatioAchieved = currentCriterionResult;
        }
      }

      currentAccumulator.outputValues.push(bestFoundValue);
      currentAccumulator.nextSearchValue = bestFoundValue + 1;
      return currentAccumulator;
    }, { nextSearchValue: 2, outputValues: initialSequenceOutput });

  return finalState.outputValues.join('\n');
};

const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processSequence(inputData));