const parseInteger = (inputString) => parseInt(inputString, 10);

const parseIntegerArray = (stringArray) => stringArray.map((element) => parseInteger(element));

const calculateAbsoluteValue = (numericValue) => (numericValue > 0 ? numericValue : -numericValue);

function findMinimum() {
  const argumentList = arguments;
  let minimumValue = argumentList[0];
  for (let index = 1; index < argumentList.length; index++) {
    if (argumentList[index] < minimumValue) {
      minimumValue = argumentList[index];
    }
  }
  return minimumValue;
}

function findMaximum() {
  const argumentList = arguments;
  let maximumValue = argumentList[0];
  for (let index = 1; index < argumentList.length; index++) {
    if (argumentList[index] > maximumValue) {
      maximumValue = argumentList[index];
    }
  }
  return maximumValue;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(rawInputString) {
  const inputLines = rawInputString.split('\n');

  const dimensionsGoals = inputLines[0].split(' ');
  const numProblems = parseInteger(dimensionsGoals[0]);
  const targetScore = parseInteger(dimensionsGoals[1]) / 100;

  const problemCategories = [];
  let temporaryVariable;
  let totalProblemsSolved = 0;
  let currentScore = 0;

  for (let problemIndex = 0; problemIndex < numProblems; problemIndex++) {
    problemCategories[problemIndex] = parseIntegerArray(inputLines[problemIndex + 1].split(' '));
    problemCategories[problemIndex][1] /= 100;
    problemCategories[problemIndex][2] = (problemIndex + 1) + (problemCategories[problemIndex][1] / problemCategories[problemIndex][0]);
    problemCategories[problemIndex][3] = problemIndex + 1;
  }

  problemCategories.sort(function(categoryA, categoryB) {
    return categoryB[2] - categoryA[2];
  });

  let bestOptionCount, currentOptionCount, unusedVarZ, unusedVarW;

  while (true) {
    bestOptionCount = -1;

    for (let categoryIdx = 0; categoryIdx < problemCategories.length; categoryIdx++) {
      if (currentScore + problemCategories[categoryIdx][0] * problemCategories[categoryIdx][3] >= targetScore) {
        currentOptionCount = Math.ceil((targetScore - currentScore) / problemCategories[categoryIdx][3]);
        if (bestOptionCount === -1 || bestOptionCount > currentOptionCount) {
          bestOptionCount = currentOptionCount;
        }
      } else if (currentScore + problemCategories[categoryIdx][0] * problemCategories[categoryIdx][3] + problemCategories[categoryIdx][1] >= targetScore) {
        currentOptionCount = problemCategories[categoryIdx][0];
        if (bestOptionCount === -1 || bestOptionCount > currentOptionCount) {
          bestOptionCount = currentOptionCount;
        }
      }
    }

    if (bestOptionCount !== -1) {
      console.log(totalProblemsSolved + bestOptionCount);
      return 0;
    }

    totalProblemsSolved += problemCategories[0][0];
    currentScore += problemCategories[0][0] * problemCategories[0][3] + problemCategories[0][1];
    problemCategories.shift();
  }
}
