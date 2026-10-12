function CalculateTotal(rawInputString) {
  const cleanedInput = rawInputString.replace(/\n+$/, '');
  const inputDataLines = cleanedInput.split(/\n/);

  const totalIterations = Number(inputDataLines[0]);
  const thresholdForValueChange = Number(inputDataLines[1]);
  const valueToAddBeforeThreshold = Number(inputDataLines[2]);
  const valueToAddAfterThreshold = Number(inputDataLines[3]);

  let cumulativeSum = 0;

  for (let currentIteration = 0; currentIteration < totalIterations; currentIteration++) {
    let currentValueForAddition;

    if (currentIteration < thresholdForValueChange) {
      currentValueForAddition = valueToAddBeforeThreshold;
    } else {
      currentValueForAddition = valueToAddAfterThreshold;
    }
    
    cumulativeSum += currentValueForAddition;
  }

  console.log(cumulativeSum);
}

CalculateTotal(require("fs").readFileSync("/dev/stdin", "utf8"));
