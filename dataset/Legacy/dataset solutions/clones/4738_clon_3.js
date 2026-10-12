const STANDARD_INPUT_PATH = "/dev/stdin";

function createInputReader() {
  const rawDataLines = require("fs").readFileSync(STANDARD_INPUT_PATH, "utf8").trim().split("\n");
  let currentLineIndex = 0;
  const totalAvailableLines = rawDataLines.length;

  const readerInstance = {
    readNextLine: function() {
      if (!this.hasMoreLines()) {
        throw "NoSuchElementException:次に要素は無いよ";
      }
      const lineToReturn = rawDataLines[currentLineIndex];
      currentLineIndex++;
      return lineToReturn;
    },
    hasMoreLines: function() {
      return (currentLineIndex < totalAvailableLines);
    }
  };
  return readerInstance;
}

const globalInputReader = createInputReader();

function getNextInputLine() { return globalInputReader.readNextLine(); }
function readInteger() { return processInputData(getNextInputLine(), 1); }
function readStringArray() { return processInputData(getNextInputLine(), 2); }
function readIntegerArray() { return processInputData(getNextInputLine(), 4); }
function readCharacterArray() { return processInputData(getNextInputLine(), 6); }
function canReadMore() { return globalInputReader.hasMoreLines(); }

function printOutput(content) { console.log(content); }
function printError(content) { console.error(content); }

function processInputData(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map((item) => Number(item));
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map((item) => Number(item));
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
}

function executeMainLogic() {
  const inputNumber = readInteger();

  const BASE_MULTIPLIER_FOR_FULL_BLOCKS = 2;
  let calculatedResult = Math.floor(inputNumber / 11) * BASE_MULTIPLIER_FOR_FULL_BLOCKS;

  const remainderValue = inputNumber % 11;

  if (remainderValue > 0) {
    if (remainderValue >= 7) {
      calculatedResult += BASE_MULTIPLIER_FOR_FULL_BLOCKS;
    } else {
      calculatedResult++;
    }
  }

  printOutput(calculatedResult);
}

executeMainLogic();
