var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const CONV_TYPE_PARSE_INT = 1;
const CONV_TYPE_SPLIT_STRING = 2;
const CONV_TYPE_SPLIT_AND_PARSE_INT_ARRAY = 4;
const CONV_TYPE_SPLIT_CHAR = 6;
const CONV_TYPE_SPLIT_CHAR_AND_PARSE_INT_ARRAY = 7;
const CONV_TYPE_JOIN_SPACE = 8;
const CONV_TYPE_JOIN_NEWLINE = 9;
const CONV_TYPE_JOIN_EMPTY = 0;

const NO_SUCH_ELEMENT_ERROR_MESSAGE = "NoSuchElementException:次に要素は無いよ";

var dataIterator = {
  sourceLines: rawData,
  currentIdx: 0,
  totalLines: rawData.length,

  hasMore: function() {
    return this.currentIdx < this.totalLines;
  },

  getNextLine: function() {
    if (!this.hasMore()) {
      throw NO_SUCH_ELEMENT_ERROR_MESSAGE;
    }
    let retrievedLine = this.sourceLines[this.currentIdx];
    this.currentIdx = this.currentIdx + 1;
    return retrievedLine;
  }
};

processInput();

function fetchNext() {
  return dataIterator.getNextLine();
}

function fetchNextInt() {
  return convertInput(fetchNext(), CONV_TYPE_PARSE_INT);
}

function fetchNextStringArray() {
  return convertInput(fetchNext(), CONV_TYPE_SPLIT_STRING);
}

function fetchNextIntegerArray() {
  return convertInput(fetchNext(), CONV_TYPE_SPLIT_AND_PARSE_INT_ARRAY);
}

function fetchNextCharacterArray() {
  return convertInput(fetchNext(), CONV_TYPE_SPLIT_CHAR);
}

function hasMoreElements() {
  return dataIterator.hasMore();
}

function printOutput(outputValue) {
  console.log(outputValue);
}

function printError(errorValue) {
  console.error(errorValue);
}

function convertInput(inputValue, conversionType) {
  try {
    let conversionResult;
    switch (conversionType) {
      case CONV_TYPE_PARSE_INT:
        conversionResult = parseInt(inputValue);
        break;
      case CONV_TYPE_SPLIT_STRING:
        conversionResult = inputValue.split(" ");
        break;
      case CONV_TYPE_SPLIT_AND_PARSE_INT_ARRAY:
        const stringParts = inputValue.split(" ");
        conversionResult = stringParts.map((element) => Number(element));
        break;
      case CONV_TYPE_SPLIT_CHAR:
        conversionResult = inputValue.split("");
        break;
      case CONV_TYPE_SPLIT_CHAR_AND_PARSE_INT_ARRAY:
        const charParts = inputValue.split("");
        conversionResult = charParts.map((element) => Number(element));
        break;
      case CONV_TYPE_JOIN_SPACE:
        conversionResult = inputValue.join(" ");
        break;
      case CONV_TYPE_JOIN_NEWLINE:
        conversionResult = inputValue.join("\n");
        break;
      case CONV_TYPE_JOIN_EMPTY:
        conversionResult = inputValue.join("");
        break;
      default:
        conversionResult = inputValue;
    }
    return conversionResult;
  } catch (e) {
    return inputValue;
  }
}

function processInput() {
  const firstLineData = fetchNextIntegerArray();
  let valA = firstLineData[0];
  let valB = firstLineData[1];
  const iterations = firstLineData[2];

  for (let loopCounter = 0; loopCounter < iterations; loopCounter++) {
    const isCurrentIterationEven = (loopCounter % 2 === 0);

    if (isCurrentIterationEven) {
      const isValAOdd = (valA % 2 !== 0);
      if (isValAOdd) {
        valA = valA - 1;
      }
      const halfOfValA = valA / 2;
      valB = valB + halfOfValA;
      valA = halfOfValA;
    } else {
      const isValBOdd = (valB % 2 !== 0);
      if (isValBOdd) {
        valB = valB - 1;
      }
      const halfOfValB = valB / 2;
      valA = valA + halfOfValB;
      valB = halfOfValB;
    }
  }
  const finalResultString = valA + " " + valB;
  printOutput(finalResultString);
}
