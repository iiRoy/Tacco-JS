function processInput(rawData) {
  const inputLines = rawData.split("\n");
  const numQueries = parseInt(inputLines[0], 10);

  for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
    const currentLineData = inputLines[queryIdx + 1];
    const numberStrings = currentLineData.split(" ");
    
    const firstOperand = parseInt(numberStrings[0], 10);
    const secondOperand = parseInt(numberStrings[1], 10);

    const minValue = Math.min(firstOperand, secondOperand);
    const maxValue = Math.max(firstOperand, secondOperand);

    const productOfValues = minValue * maxValue;
    const squareRootOfProduct = Math.sqrt(productOfValues);
    const loopUpperLimit = Math.ceil(squareRootOfProduct);

    let finalResultCount = (minValue - 1) * 2;

    const comparisonThreshold = maxValue - 1;
    if (minValue < comparisonThreshold) {
      finalResultCount++;
    }

    for (let currentIterationValue = minValue + 1; currentIterationValue < loopUpperLimit; currentIterationValue++) {
      const divisionResult = minValue / currentIterationValue;
      const multipliedResult = divisionResult * maxValue;
      const flooredValue = Math.floor(multipliedResult);

      if (flooredValue === currentIterationValue) {
        finalResultCount++;
      } else {
        finalResultCount += 2;
      }
    }
    console.log(finalResultCount);
  }
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(fileContent);
