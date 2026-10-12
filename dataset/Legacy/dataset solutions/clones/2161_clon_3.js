const fileSystem = require("fs");
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8").trim().split("\n");

const inputProcessor = (function(dataLines) {
  let currentLinePointer = 0;
  const totalAvailableLines = dataLines.length;

  const checkMoreLines = () => currentLinePointer < totalAvailableLines;

  const getNextLine = () => {
    if (!checkMoreLines()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    const lineToReturn = dataLines[currentLinePointer];
    currentLinePointer++;
    return lineToReturn;
  };

  return {
    fetchNext: getNextLine,
    hasMore: checkMoreLines
  };
})(rawInputData);

function fetchNextLine() { return inputProcessor.fetchNext(); }
function checkMoreLines() { return inputProcessor.hasMore(); }

function printResult(content) { console.log(content); }
function logError(errorContent) { console.error(errorContent); }

function transformInput(inputValue, conversionType) {
  try {
    let processedValue;
    switch (conversionType) {
      case 1:
        processedValue = parseInt(inputValue, 10);
        break;
      case 2:
        processedValue = inputValue.split(" ");
        break;
      case 4:
        processedValue = inputValue.split(" ").map((item) => Number(item));
        break;
      case 6:
        processedValue = inputValue.split("");
        break;
      case 7:
        processedValue = inputValue.split("").map((item) => Number(item));
        break;
      case 8:
        processedValue = inputValue.join(" ");
        break;
      case 9:
        processedValue = inputValue.join("\n");
        break;
      case 0:
        processedValue = inputValue.join("");
        break;
      default:
        processedValue = inputValue;
    }
    return processedValue;
  } catch (error) {
    return inputValue;
  }
}

function executeCoreLogic() {
  const firstInputLine = fetchNextLine();
  const digitArray = transformInput(firstInputLine, 7);

  const arrayLength = digitArray.length;
  let finalSum = 0;

  for (let currentIndex = arrayLength - 1; currentIndex >= 0; currentIndex--) {
    const currentDigitValue = digitArray[currentIndex];

    if (currentDigitValue >= 6) {
      const complementValue = 10 - currentDigitValue;
      finalSum += complementValue;
      digitArray[currentIndex] = 0;

      if (currentIndex !== 0) {
        digitArray[currentIndex - 1]++;
      } else {
        finalSum++;
      }
    } else {
      finalSum += currentDigitValue;
    }
  }
  printResult(finalSum);
}

executeCoreLogic();
