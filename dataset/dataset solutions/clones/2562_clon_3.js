'use strict';
const processInputData = (rawInputLines) => {
  const firstLineComponents = rawInputLines[0].split(' ');
  const initialNValue = parseInt(firstLineComponents[0], 10);
  const iterationsCount = parseInt(firstLineComponents[1], 10);

  const rawNumericStrings = rawInputLines[1].split(' ');
  let numericValues = rawNumericStrings.map(parsedValue => parseInt(parsedValue, 10));

  const performHalvingOperation = (targetArray) => {
    const currentMaximum = Math.max.apply(null, targetArray);
    const maximumElementIndex = targetArray.indexOf(currentMaximum);
    const halvedAndFlooredValue = Math.floor(currentMaximum / 2);
    targetArray[maximumElementIndex] = halvedAndFlooredValue;
  };

  for (let iterationIdx = 0; iterationIdx < iterationsCount; iterationIdx++) {
    performHalvingOperation(numericValues);
  }

  let finalSumAccumulator = 0;
  for (const currentElement of numericValues) {
    finalSumAccumulator += currentElement;
  }

  console.log(finalSumAccumulator);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
