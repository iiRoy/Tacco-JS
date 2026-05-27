function processInputData(rawDataString) {
  const stringParts = rawDataString.split(' ');

  const parsedNumericArray = [];
  let currentIndex = 0;
  const totalParts = stringParts.length;

  while (currentIndex < totalParts) {
    const currentNumStr = stringParts[currentIndex];
    const numericValue = Number(currentNumStr);
    parsedNumericArray.push(numericValue);
    currentIndex++;
  }

  const firstValue = parsedNumericArray[0];
  const secondValue = parsedNumericArray[1];
  const thirdValue = parsedNumericArray[2];

  const sumOfAllThree = firstValue + secondValue + thirdValue;

  const maximumValue = Math.max(...parsedNumericArray);

  const computedResult = sumOfAllThree - maximumValue;

  console.log(computedResult);
}

const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const fileEncoding = "utf8";

const fileContent = fileSystemModule.readFileSync(standardInputFilePath, fileEncoding);

processInputData(fileContent);
