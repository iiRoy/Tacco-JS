function processInputData(rawInputString) {
  const NEWLINE_DELIMITER = "\n";
  const SPACE_DELIMITER = " ";

  const inputLines = rawInputString.split(NEWLINE_DELIMITER);

  const firstLineParts = inputLines[0].split(SPACE_DELIMITER);

  const parseInteger = (strValue) => parseInt(strValue, 10);

  const firstParamK = parseInteger(firstLineParts[0]);
  const secondParamT = parseInteger(firstLineParts[1]);

  const elementStrings = inputLines[1].split(SPACE_DELIMITER);
  const numericElements = elementStrings.map((elementString) => {
    return parseInteger(elementString);
  });

  numericElements.sort((valX, valY) => {
    return valY - valX;
  });

  const largestElement = numericElements[0];

  const totalSumOfElements = numericElements.reduce((currentSum, currentNum) => {
    return currentSum + currentNum;
  }, 0);

  const twiceLargestMinusOne = (2 * largestElement) - 1;
  const differenceFromSum = twiceLargestMinusOne - totalSumOfElements;

  const finalResult = Math.max(differenceFromSum, 0);

  console.log(finalResult);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(fileContent);
