var fileSystem = require("fs");

function createInputFeeder(rawLines) {
  let currentPosition = 0;
  const totalCount = rawLines.length;

  return {
    retrieveNext: () => {
      if (currentPosition >= totalCount) {
        throw "NoSuchElementException:次に要素は無いよ";
      }
      return rawLines[currentPosition++];
    },
    hasMore: () => currentPosition < totalCount,
  };
}

const dataProcessors = new Map([
  [1, (val) => parseInt(val)],
  [2, (val) => val.split(" ")],
  [4, (val) => val.split(" ").map(Number)],
  [6, (val) => val.split("")],
  [7, (val) => val.split("").map(Number)],
  [8, (val) => val.join(" ")],
  [9, (val) => val.join("\n")],
  [0, (val) => val.join("")],
]);

function processInputData(dataItem, conversionType) {
  try {
    const handler = dataProcessors.get(conversionType);
    return handler ? handler(dataItem) : dataItem;
  } catch (err) {
    return dataItem;
  }
}

function displayOutput(content) {
  console.log(content);
}

function reportError(message) {
  console.error(message);
}

function calculateCumulativeXor(upperBound) {
  if (upperBound < 0) return 0;
  switch (upperBound % 4) {
    case 0: return upperBound;
    case 1: return 1;
    case 2: return upperBound + 1;
    case 3: return 0;
  }
}

function runApplication() {
  const rawInputLines = fileSystem.readFileSync("/dev/stdin", "utf8").trim().split("\n");
  const inputFeeder = createInputFeeder(rawInputLines);

  const parsedValues = processInputData(inputFeeder.retrieveNext(), 4);
  const firstNum = parsedValues[0];
  const secondNum = parsedValues[1];

  const result = calculateCumulativeXor(secondNum) ^ calculateCumulativeXor(firstNum - 1);
  displayOutput(result);
}

runApplication();
