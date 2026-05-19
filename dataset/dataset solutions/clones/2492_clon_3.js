function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayOutput(resultValue) {
  console.log(resultValue);
}

const convertStringToNumber = (str) => Number(str);

const inputConversionStrategies = {
  0: (data) => data,
  1: (data) => parseInt(data),
  2: (data) => data.split(" "),
  3: (data) => data.split("\n"),
  4: (data) => data.split(" ").map(convertStringToNumber),
  5: (data) => data.split("\n").map(convertStringToNumber),
  6: (data) => data.split(""),
  7: (data) => data.split("").map(convertStringToNumber),
};

function processInputData(rawData, conversionType) {
  const strategyExecutor = inputConversionStrategies[conversionType];
  if (strategyExecutor) {
    return strategyExecutor(rawData);
  }
  return undefined;
}

function calculateAndDisplayProductSum(rawInputContent) {
  const inputLinesArray = processInputData(rawInputContent, 3);

  const numberOfElements = processInputData(inputLinesArray[0], 1);
  const numericList = processInputData(inputLinesArray[1], 4);

  let accumulatedProductSum = 0;

  if (numberOfElements < 2) {
    displayOutput(accumulatedProductSum);
    return;
  }

  const outerLoopUpperBound = numberOfElements - 1;

  for (let firstIndex = 0; firstIndex < outerLoopUpperBound; firstIndex++) {
    for (let secondIndex = firstIndex + 1; secondIndex < numberOfElements; secondIndex++) {
      accumulatedProductSum += numericList[firstIndex] * numericList[secondIndex];
    }
  }

  displayOutput(accumulatedProductSum);
}

calculateAndDisplayProductSum(getInputData());
