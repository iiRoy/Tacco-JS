'use strict'

function evaluateMagnitude(subjectA, subjectB) {
  if (subjectA === subjectB) {
    return 0;
  }

  const lengthA = subjectA.length;
  const lengthB = subjectB.length;

  if (lengthA > lengthB) {
    return 1;
  }
  if (lengthA < lengthB) {
    return -1;
  }

  function digitCompare(index) {
    if (index === lengthA) {
      return 0;
    }

    const digitA = parseInt(subjectA[index], 10);
    const digitB = parseInt(subjectB[index], 10);

    if (digitA > digitB) {
      return 1;
    }
    if (digitA < digitB) {
      return -1;
    }

    return digitCompare(index + 1);
  }

  return digitCompare(0);
}

function processInputData(sourceData) {
  const [valueOne, valueTwo] = sourceData.split('\n');

  const outcomeMap = new Map([
    [-1, 'LESS'],
    [0, 'EQUAL'],
    [1, 'GREATER']
  ]);

  const finalOutcome = evaluateMagnitude(valueOne, valueTwo);
  console.log(outcomeMap.get(finalOutcome));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));