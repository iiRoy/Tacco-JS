var inputHandler = initializeInputReader();
executeMainLogic();

function readNextInt() { return dataConverter(getNextLine(), 1); }
function readNextStringArray() { return dataConverter(getNextLine(), 2); }
function readNextIntArray() { return dataConverter(getNextLine(), 4); }
function readNextCharArray() { return dataConverter(getNextLine(), 6); }
function getNextLine() { return inputHandler.next(); }
function hasMoreLines() { return inputHandler.hasMoreLines(); }

function readInputFile() { return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"); }

function initializeInputReader() {
  var rawInputLines = readInputFile();
  var currentIdx = 0;
  var maxIdx = rawInputLines.length;

  function checkHasMoreLines() {
    return (currentIdx < maxIdx);
  }

  function retrieveNextLine() {
    if (!checkHasMoreLines()) {
      return "";
    } else {
      var lineToReturn = rawInputLines[currentIdx];
      currentIdx++;
      return lineToReturn;
    }
  }

  var readerInstance = {
    "hasMoreLines": checkHasMoreLines,
    "next": retrieveNextLine
  };
  return readerInstance;
}

function printOutput(message) { console.log(message); }
function printError(message) { console.error(message); }

const conversionStrategies = {
  1: (val) => parseInt(val),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  8: (arr) => arr.join(" "),
  9: (arr) => arr.join("\n"),
  0: (arr) => arr.join("")
};

function dataConverter(inputValue, conversionType) {
  try {
    const strategy = conversionStrategies[conversionType];
    if (strategy) {
      return strategy(inputValue);
    }
    return inputValue;
  } catch (e) {
    return inputValue;
  }
}

function executeMainLogic() {
  var inputCount = readNextInt();
  var dataList = readNextIntArray();

  const validateInputSequence = (sequence, count) => {
    for (let idx = 0; idx < count; idx++) {
      if (sequence[idx] > (idx + 1)) {
        return false;
      }
    }
    return true;
  };

  if (!validateInputSequence(dataList, inputCount)) {
    printOutput(-1);
    return;
  }

  var resultSequence = [];
  var currentScanIndex = 0;

  while (dataList.length > 0) {
    const isCurrentElementCorrectlyPositioned = (currentScanIndex < dataList.length) && (dataList[currentScanIndex] === currentScanIndex + 1);

    if (isCurrentElementCorrectlyPositioned) {
      currentScanIndex++;
    } else {
      const elementToMove = dataList[currentScanIndex - 1];
      resultSequence.unshift(elementToMove);
      dataList.splice(currentScanIndex - 1, 1);
      currentScanIndex = 0;
    }
  }
  
  printOutput(dataConverter(resultSequence, 9));
}
