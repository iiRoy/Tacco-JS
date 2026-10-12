const readLineSync = require('readline-sync');

(function() {
  let targetValue;
  targetValue = parseInt(readLineSync.question());

  let numberOfRanges;
  numberOfRanges = parseInt(readLineSync.question());

  targetValue -= 1;

  let waysToReach = new Array(targetValue + 1).fill(0);

  let permittedSteps = new Set();

  let currentRangeStart;
  let currentRangeEnd;

  const modulusConstant = 998244353;

  for (let rangeIndex = 0; rangeIndex < numberOfRanges; ++rangeIndex) {
    currentRangeStart = parseInt(readLineSync.question());
    currentRangeEnd = parseInt(readLineSync.question());

    for (let stepSize = currentRangeStart; stepSize <= currentRangeEnd; ++stepSize) {
      permittedSteps.add(stepSize);
    }
  }

  for (let individualStep of permittedSteps) {
    if (individualStep <= targetValue) {
      waysToReach[individualStep] += 1;
    }
  }

  for (let currentTarget = 2; currentTarget <= targetValue; ++currentTarget) {
    for (let individualStep of permittedSteps) {
      if (currentTarget > individualStep) {
        waysToReach[currentTarget] = (waysToReach[currentTarget] + waysToReach[currentTarget - individualStep]) % modulusConstant;
      }
    }
  }

  console.log(waysToReach[targetValue] % modulusConstant);
})();
