const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const rawData = fileContent.trim().split("\n");

const createInputReader = (lines) => {
  let currentLineIndex = 0;
  const totalLines = lines.length;

  const hasMoreLines = () => currentLineIndex < totalLines;

  const fetchNextLine = () => {
    if (!hasMoreLines()) {
      return "";
    }
    const lineToReturn = lines[currentLineIndex];
    currentLineIndex++;
    return lineToReturn;
  };

  return {
    hasMoreLines,
    fetchNextLine,
  };
};

const inputReader = createInputReader(rawData);

function getNextInputLine() { return inputReader.fetchNextLine(); }
function checkMoreLines() { return inputReader.hasMoreLines(); }

const CONV_TYPE_INT = 1;
const CONV_TYPE_STR_ARRAY = 2;
const CONV_TYPE_INT_ARRAY = 4;
const CONV_TYPE_CHAR_ARRAY = 6;
const CONV_TYPE_CHAR_INT_ARRAY = 7;
const CONV_TYPE_JOIN_SPACE = 8;
const CONV_TYPE_JOIN_NEWLINE = 9;
const CONV_TYPE_JOIN_NONE = 0;

function convertInput(inputValue, conversionType) {
  try {
    const defaultReturnValue = inputValue;
    switch (conversionType) {
      case CONV_TYPE_INT:
        return parseInt(inputValue);
      case CONV_TYPE_STR_ARRAY:
        return inputValue.split(" ");
      case CONV_TYPE_INT_ARRAY:
        return inputValue.split(" ").map(Number);
      case CONV_TYPE_CHAR_ARRAY:
        return inputValue.split("");
      case CONV_TYPE_CHAR_INT_ARRAY:
        return inputValue.split("").map(Number);
      case CONV_TYPE_JOIN_SPACE:
        return inputValue.join(" ");
      case CONV_TYPE_JOIN_NEWLINE:
        return inputValue.join("\n");
      case CONV_TYPE_JOIN_NONE:
        return inputValue.join("");
      default:
        return defaultReturnValue;
    }
  } catch (conversionError) {
    return inputValue;
  }
}

function parseNextInt() { return convertInput(getNextInputLine(), CONV_TYPE_INT); }
function parseNextStringArray() { return convertInput(getNextInputLine(), CONV_TYPE_STR_ARRAY); }
function parseNextIntArray() { return convertInput(getNextInputLine(), CONV_TYPE_INT_ARRAY); }
function parseNextCharArr() { return convertInput(getNextInputLine(), CONV_TYPE_CHAR_ARRAY); }

function printOutput(data) { console.log(data); }
function printError(data) { console.error(data); }

function executeMainLogic() {
  const inputNumbers = parseNextIntArray();
  const firstNum = inputNumbers[0];
  const secondNum = inputNumbers[1];

  const reciprocalFirst = 1 / firstNum;
  const reciprocalSecond = 1 / secondNum;

  const sumOfReciprocals = reciprocalFirst + reciprocalSecond;

  const finalResult = 1 / sumOfReciprocals;

  printOutput(finalResult);
}

executeMainLogic();
