const fileSystem = require("fs");

function readStdinContent() {
  return fileSystem.readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

const rawDataLines = readStdinContent();

const CONVERT_TO_INT = 1;
const SPLIT_BY_SPACE = 2;
const SPLIT_AND_PARSE_INT_ARRAY = 4;
const SPLIT_BY_CHAR = 6;
const SPLIT_AND_PARSE_CHAR_INT_ARRAY = 7;
const JOIN_BY_SPACE = 8;
const JOIN_BY_NEWLINE = 9;
const JOIN_WITHOUT_SEPARATOR = 0;

function dataConverter(inputValue, conversionType) {
  try {
    const conversionOperations = {
      [CONVERT_TO_INT]: (val) => parseInt(val),
      [SPLIT_BY_SPACE]: (val) => val.split(" "),
      [SPLIT_AND_PARSE_INT_ARRAY]: (val) => val.split(" ").map(Number),
      [SPLIT_BY_CHAR]: (val) => val.split(""),
      [SPLIT_AND_PARSE_CHAR_INT_ARRAY]: (val) => val.split("").map(Number),
      [JOIN_BY_SPACE]: (val) => val.join(" "),
      [JOIN_BY_NEWLINE]: (val) => val.join("\n"),
      [JOIN_WITHOUT_SEPARATOR]: (val) => val.join(""),
    };

    const selectedConverter = conversionOperations[conversionType];
    if (selectedConverter) {
      return selectedConverter(inputValue);
    }
    return inputValue;
  } catch (error) {
    return inputValue;
  }
}

const inputProcessor = {
  dataLines: rawDataLines,
  currentLineIndex: 0,
  totalLines: rawDataLines.length,
};

inputProcessor.fetchNextLine = function() {
  if (!this.hasMoreLines()) {
    throw "NoSuchElementException:次に要素は無いよ";
  }
  const lineContent = this.dataLines[this.currentLineIndex];
  this.currentLineIndex++;
  return lineContent;
};

inputProcessor.hasMoreLines = function() {
  return this.currentLineIndex < this.totalLines;
};

function getNextInputLine() {
  return inputProcessor.fetchNextLine();
}

function readInteger() {
  return dataConverter(getNextInputLine(), CONVERT_TO_INT);
}

function readStringArray() {
  return dataConverter(getNextInputLine(), SPLIT_BY_SPACE);
}

function readIntegerArray() {
  return dataConverter(getNextInputLine(), SPLIT_AND_PARSE_INT_ARRAY);
}

function readCharacterArray() {
  return dataConverter(getNextInputLine(), SPLIT_BY_CHAR);
}

function canReadMore() {
  return inputProcessor.hasMoreLines();
}

function printOutput(content) {
  console.log(content);
}

function printError(content) {
  console.error(content);
}

executeMainLogic();

function executeMainLogic() {
  const firstLineValues = readIntegerArray();
  const [valA, valB] = firstLineValues;

  const moduloResult = valB % valA;

  let finalCalculationResult;
  if (moduloResult === 0) {
    finalCalculationResult = valA - valB;
  } else {
    finalCalculationResult = valA + valB;
  }
  printOutput(finalCalculationResult);
}
