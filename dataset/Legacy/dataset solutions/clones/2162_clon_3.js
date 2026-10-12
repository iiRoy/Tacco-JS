const NO_SUCH_ELEMENT_ERROR = "NoSuchElementException:次に要素は無いよ";

var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var inputIterator = {
  dataLines: rawData,
  currentIdx: 0,
  totalLines: rawData.length,
  getNextLine: function() {
    if (!this.hasMoreLines()) {
      throw NO_SUCH_ELEMENT_ERROR;
    }
    var lineToReturn = this.dataLines[this.currentIdx];
    this.currentIdx++;
    return lineToReturn;
  },
  hasMoreLines: function() {
    return this.currentIdx < this.totalLines;
  }
};

function fetchNextLine() {
  return inputIterator.getNextLine();
}

function canFetchMore() {
  return inputIterator.hasMoreLines();
}

function printOutput(message) {
  console.log(message);
}

function printError(message) {
  console.error(message);
}

function convertInput(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputVal, 10);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map(Number);
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map(Number);
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (conversionError) {
    return inputVal;
  }
}

function processData() {
  const TARGET_VALUE = 10;

  var rawDigitString = fetchNextLine();
  var digitList = convertInput(rawDigitString, 7);
  var listLength = digitList.length;
  var finalSum = 0;
  var digitFrequency = {};

  for (var idx = listLength - 1; idx >= 0; idx--) {
    var currentDigit = digitList[idx];

    digitFrequency[currentDigit] = (digitFrequency[currentDigit] || 0) + 1;

    if (currentDigit === TARGET_VALUE) {
      printError("10が出てきた:" + idx);
      //finalSum--;
    }

    if (currentDigit >= 5) {
      var complementToAdd = TARGET_VALUE - currentDigit;
      finalSum += complementToAdd;
      digitList[idx] = 0;
      if (idx > 0) {
        digitList[idx - 1]++;
      } else {
        finalSum++;
      }
    } else {
      finalSum += currentDigit;
    }
  }

  printOutput(finalSum);
  //なぜか6回分足しすぎてる
  printError(digitFrequency);
}

processData();
