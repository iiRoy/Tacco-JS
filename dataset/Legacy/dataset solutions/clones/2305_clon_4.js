function processData(dataLines) {
  const loopIterations = dataLines[0][1];
  const orderedValues = dataLines[1].sort((firstVal, secondVal) => secondVal - firstVal);

  const resultTotal = Array.from({ length: loopIterations }).reduce((currentSum) => {
    return currentSum + (orderedValues[0] * 2);
  }, 0);

  const valueAggregates = orderedValues.map((singleVal) => [singleVal * 2]);

  const appendedComponents = Array.from({ length: loopIterations }).map((_, index) => {
    const nextElementIndex = index + 1;
    return orderedValues[nextElementIndex] !== undefined
      ? (orderedValues[0] + orderedValues[nextElementIndex])
      : 0;
  });

  valueAggregates[0].push(...appendedComponents);

  console.log(resultTotal);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8").trim()
  .split('\n')
  .map((line) => line.split(' ').map(Number))
);
