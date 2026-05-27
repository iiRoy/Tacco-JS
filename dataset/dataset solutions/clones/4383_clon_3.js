const fileSystemModule = require("fs");

const STDIN_FILE_PATH = "/dev/stdin";

function processData(rawInputString) {
  const inputLines = rawInputString.split("\n");
  const numElements = parseInt(inputLines[0], 10); // N is parsed but not used in the original logic
  const dataValues = inputLines[1].split(" ").map(val => parseInt(val, 10));

  let maximumCount = 0;

  for (const currentValue of dataValues) {
    const targetMinusOne = currentValue - 1;
    const targetItself = currentValue;
    const targetPlusOne = currentValue + 1;

    const countForMinusOne = calculateOccurrences(dataValues, targetMinusOne);
    const countForItself = calculateOccurrences(dataValues, targetItself);
    const countForPlusOne = calculateOccurrences(dataValues, targetPlusOne);

    const currentNeighborhoodCount = countForMinusOne + countForItself + countForPlusOne;

    if (currentNeighborhoodCount > maximumCount) {
      maximumCount = currentNeighborhoodCount;
    }
  }
  console.log(maximumCount);
}

function calculateOccurrences(dataArray, targetNumber) {
  let occurrenceTally = 0;
  for (let arrayIndex = 0; arrayIndex < dataArray.length; arrayIndex++) {
    if (dataArray[arrayIndex] === targetNumber) {
      occurrenceTally++;
    }
  }
  return occurrenceTally;
}

processData(fileSystemModule.readFileSync(STDIN_FILE_PATH, "utf-8"));
