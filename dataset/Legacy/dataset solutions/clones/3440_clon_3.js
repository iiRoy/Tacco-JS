function readInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function printOutput(message) {
  console.log(message);
}

function printError(message) {
  console.error(message);
}

const conversionStrategies = {
  0: (inputString) => inputString,
  1: (inputString) => parseInt(inputString, 10),
  2: (inputString) => inputString.split(" "),
  3: (inputString) => inputString.split("\n"),
  4: (inputString) => inputString.split(" ").map((valStr) => Number(valStr)),
  5: (inputString) => inputString.split("\n").map((valStr) => Number(valStr)),
  6: (inputString) => inputString.split(""),
  7: (inputString) => inputString.split("").map((valStr) => Number(valStr)),
};

function convertInput(inputString, conversionType) {
  const strategy = conversionStrategies[conversionType];
  // The original switch statement would implicitly return undefined if no case matched.
  // Given the problem context, conversionType is expected to be 0-7.
  return strategy ? strategy(inputString) : inputString;
}

function calculateAverage(dataPoints) {
  const totalSum = dataPoints.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
  return totalSum / dataPoints.length;
}

function findClosestElementIndex(elements, targetValue) {
  if (elements.length === 0) {
    return 0; // Matches original behavior: if N=0, output is 0.
  }

  let minDifference = Infinity;
  let closestIndex = 0; // Initialize with 0, as the first element is a candidate

  for (let idx = 0; idx < elements.length; idx++) {
    const currentElement = elements[idx];
    const absoluteDifference = Math.abs(currentElement - targetValue);

    if (absoluteDifference < minDifference) {
      minDifference = absoluteDifference;
      closestIndex = idx;
    }
  }
  return closestIndex;
}

function processData(rawData) {
  const lines = convertInput(rawData, 3);
  const itemCount = convertInput(lines[0], 1);
  const dataPoints = convertInput(lines[1], 4);

  const averageValue = calculateAverage(dataPoints);
  const resultIndex = findClosestElementIndex(dataPoints, averageValue);

  printOutput(resultIndex);
}

processData(readInput());
