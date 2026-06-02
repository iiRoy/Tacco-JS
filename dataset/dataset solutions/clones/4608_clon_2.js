var dataHandler = initializeInputProcessor();

executePrimaryLogic();

function retrieveNextInteger() {
  return convertInput(fetchNextLine(), 1);
}

function retrieveNextStringArray() {
  return convertInput(fetchNextLine(), 2);
}

function retrieveNextIntegerArray() {
  return convertInput(fetchNextLine(), 4);
}

function retrieveNextCharacterArray() {
  return convertInput(fetchNextLine(), 6);
}

function fetchNextLine() {
  return dataHandler.getNext();
}

function hasMoreLines() {
  return dataHandler.hasRemaining();
}

function readInputFile() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputProcessor() {
  var rawInputLines = readInputFile();
  var inputProcessor = {
    lineCollection: rawInputLines,
    currentLineIndex: 0,
    totalLines: rawInputLines.length,
    hasRemaining: function() {
      return (this.currentLineIndex < this.totalLines);
    },
    getNext: function() {
      if (!this.hasRemaining()) {
        return "";
      } else {
        var currentLineData = this.lineCollection[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLineData;
      }
    }
  };
  return inputProcessor;
}

function displayOutput(messageContent) {
  console.log(messageContent);
}

function displayError(errorMessage) {
  console.error(errorMessage);
}

function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((itemValue) => Number(itemValue));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((itemValue) => Number(itemValue));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (conversionError) {
    return inputValue;
  }
}

function executePrimaryLogic() {
  var firstLineData = retrieveNextIntegerArray();
  var itemCount = firstLineData[0];
  var thresholdDuration = firstLineData[1];
  var timePoints = retrieveNextIntegerArray();
  var totalActiveTime = 0;
  for (var idx = 1; idx < itemCount; idx++) {
    if (timePoints[idx] - timePoints[idx - 1] > thresholdDuration) {
      totalActiveTime += thresholdDuration;
    } else {
      totalActiveTime += timePoints[idx] - timePoints[idx - 1];
    }
  }
  totalActiveTime += thresholdDuration;
  displayOutput(totalActiveTime);
}
