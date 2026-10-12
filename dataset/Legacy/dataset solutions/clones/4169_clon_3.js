"use strict";

function Main(inputData) {
  const dataLines = inputData.split('\n');

  const numberOfElements = parseInt(dataLines[0], 10);
  let numberArray = dataLines[1].split(' ').map(Number);

  let totalDivisionCount = 0;

  const processArrayForEvenDivision = (arr, len) => {
    let oddElementEncountered = false;
    const divisionFactor = 2;

    for (let elementIdx = 0; elementIdx < len; elementIdx++) {
      const currentVal = arr[elementIdx];

      if (currentVal % divisionFactor !== 0) {
        oddElementEncountered = true;
        break;
      }
      arr[elementIdx] = currentVal / divisionFactor;
    }
    return oddElementEncountered;
  };

  while (true) {
    const oddFoundThisIteration = processArrayForEvenDivision(numberArray, numberOfElements);

    if (oddFoundThisIteration) {
      break;
    }
    totalDivisionCount++;
  }

  console.log(totalDivisionCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
