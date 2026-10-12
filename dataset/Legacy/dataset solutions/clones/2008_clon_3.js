function processInput(rawData) {
  const inputParts = rawData.split(' ');
  const firstValue = parseInt(inputParts[0], 10);
  const secondValue = parseInt(inputParts[1], 10);

  const calculateAbsoluteDifference = (currentVal, constantK) => {
    const differenceResult = currentVal - constantK;
    return Math.abs(differenceResult);
  };

  const initialDifferenceMagnitude = Math.abs(firstValue - secondValue);
  let currentIterationDifference = initialDifferenceMagnitude;
  let nextIterationDifference = calculateAbsoluteDifference(currentIterationDifference, secondValue);

  while (nextIterationDifference > currentIterationDifference) {
    currentIterationDifference = nextIterationDifference;
    nextIterationDifference = calculateAbsoluteDifference(currentIterationDifference, secondValue);
  }

  console.log(nextIterationDifference);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
