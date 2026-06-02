'use strict';

function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const firstLineParts = inputLines[0].split(' ');

  const numA = Number(firstLineParts[0]);
  const numB = Number(firstLineParts[1]);
  const numC = Number(firstLineParts[2]);

  const sumOfAB = numA + numB;
  const cMinusSumOfAB = numC - sumOfAB;

  let finalResult = 'No';

  if (cMinusSumOfAB > 0) {
    const fourTimesProductAB = 4 * numA * numB;
    const squareOfCMinusSumOfAB = cMinusSumOfAB * cMinusSumOfAB;

    if (fourTimesProductAB < squareOfCMinusSumOfAB) {
      finalResult = 'Yes';
    }
  }

  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
