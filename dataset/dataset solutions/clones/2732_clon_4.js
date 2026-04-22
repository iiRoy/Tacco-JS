'use strict';
function processInputData(rawData) {
  const extractedNumbers = rawData.match(/(\d+)\s+(\d+)/);
  if (!extractedNumbers || extractedNumbers.length < 3) {
    console.log(NaN);
    return;
  }
  const firstNumericVal = +extractedNumbers[1];
  const secondNumericVal = +extractedNumbers[2];
  const effectiveDivisor = secondNumericVal * 2;

  if (effectiveDivisor === 0) {
    if (firstNumericVal > 0) {
      console.log(Infinity);
    } else {
      console.log(NaN);
    }
    return;
  }
  
  function recursiveCeilingDiv(targetVal, divisorVal, currentSum = 0, counter = 0) {
    if (currentSum >= targetVal) {
      return counter;
    }
    return recursiveCeilingDiv(targetVal, divisorVal, currentSum + divisorVal, counter + 1);
  }

  const finalResult = recursiveCeilingDiv(firstNumericVal, effectiveDivisor);
  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));