var inputHandlerInstance = initializeInputProcessor();
executePrimaryLogic();

function readNextInteger() { return performTypeConversion(fetchNextLine(), 1); }
function readNextStringArray() { return performTypeConversion(fetchNextLine(), 2); }
function readNextIntegerArray() { return performTypeConversion(fetchNextLine(), 4); }
function readNextCharacterArray() { return performTypeConversion(fetchNextLine(), 6); }

function fetchNextLine() { return inputHandlerInstance.fetchNextLine(); }
function hasMoreLines() { return inputHandlerInstance.hasMoreLines(); }

function readStandardInput() { return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"); }

function initializeInputProcessor() {
  const rawInputLines = readStandardInput();
  const inputProcessor = {
    lineList: rawInputLines,
    currentIndex: 0,
    maxLines: rawInputLines.length,
  };

  inputProcessor.hasMoreLines = function() {
    return (this.currentIndex < this.maxLines);
  };
  inputProcessor.fetchNextLine = function() {
    if (!this.hasMoreLines()) {
      return "";
    } else {
      const currentLine = this.lineList[this.currentIndex];
      this.currentIndex++;
      return currentLine;
    }
  };
  return inputProcessor;
}

function outputResult(messageContent) { console.log(messageContent); }
function outputError(messageContent) { console.error(messageContent); }

function performTypeConversion(inputValue, conversionType) {
  const conversionStrategies = {
    1: (val) => parseInt(val, 10),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join(""),
  };

  try {
    const strategy = conversionStrategies[conversionType];
    if (strategy) {
      return strategy(inputValue);
    } else {
      return inputValue;
    }
  } catch (conversionError) {
    return inputValue;
  }
}

function executePrimaryLogic() {
  const firstLineData = readNextIntegerArray();
  const totalDistance = firstLineData[0];
  const numPoints = firstLineData[1];

  const pointLocations = readNextIntegerArray();

  const segmentLengths = new Array(numPoints);
  const lastPointIndex = numPoints - 1;

  for (let idx = 0; idx < lastPointIndex; idx++) {
    const currentPointLocation = pointLocations[idx];
    const nextPointLocation = pointLocations[idx + 1];
    segmentLengths[idx] = nextPointLocation - currentPointLocation;
  }

  const lastLocation = pointLocations[lastPointIndex];
  const firstLocation = pointLocations[0];
  const wrapAroundSegmentLength = (totalDistance - lastLocation) + firstLocation;
  segmentLengths[lastPointIndex] = wrapAroundSegmentLength;

  outputError(segmentLengths);

  segmentLengths.sort((valA, valB) => valA - valB);

  segmentLengths.pop();

  const totalLength = segmentLengths.reduce((accumulator, currentSegmentLength) => {
    return accumulator + currentSegmentLength;
  }, 0);

  outputResult(totalLength);
}
