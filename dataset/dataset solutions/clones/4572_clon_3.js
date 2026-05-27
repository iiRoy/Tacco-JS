const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputHandler;
const inputLines = [];

inputReader.on('line', (lineContent) => {
  inputLines.push(lineContent);
});

const handleInputClose = () => {
  inputHandler = initializeInputHandler(inputLines);
  console.error("\n");
  const startTime = Date.now();
  executeMainLogic();
  const endTime = Date.now() - startTime;
  printDebugError("time : " + (endTime) + "ms");
  printDebugError("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
};

inputReader.on('close', handleInputClose);

function createDeepCopy(sourceObj) {
  return JSON.parse(JSON.stringify(sourceObj));
}

function readInteger() {
  return convertInput(getNextInput(), 1);
}

function readStringArray() {
  return convertInput(getNextInput(), 2);
}

function readIntegerArray() {
  return convertInput(getNextInput(), 4);
}

function readCharacterArray() {
  return convertInput(getNextInput(), 6);
}

function getNextInput() {
  return inputHandler.next();
}

function hasMoreInput() {
  return inputHandler.hasNext();
}

function initializeInputHandler(linesArray) {
  return {
    list: linesArray,
    index: 0,
    max: linesArray.length,
    hasNext: function() {
      return (this.index < this.max);
    },
    next: function() {
      if (this.hasNext()) {
        return this.list[this.index++];
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}

function printOutput(data) {
  console.log(data);
}

function printDebugError(message) {
  console.error("debug:" + require("util").inspect(message, false, null));
}

function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(Number);
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
}

function computeMinDifference(currentH, currentW, initialMinDiff) {
  let localMinDiff = initialMinDiff;

  for (let loopCounter = 1; loopCounter <= currentH - 2; loopCounter++) {
    // Scenario 1: Vertical cuts
    const firstVerticalCutHeight = loopCounter;
    const remainingHeightForVerticalCuts = currentH - firstVerticalCutHeight;
    const secondVerticalCutHeight = Math.floor(remainingHeightForVerticalCuts / 2);
    const thirdVerticalCutHeight = Math.ceil(remainingHeightForVerticalCuts / 2);

    const verticalHeights = [firstVerticalCutHeight, secondVerticalCutHeight, thirdVerticalCutHeight];
    const maxVerticalHeight = Math.max(...verticalHeights);
    const minVerticalHeight = Math.min(...verticalHeights);

    localMinDiff = Math.min(localMinDiff, (maxVerticalHeight - minVerticalHeight) * currentW);

    // Scenario 2: Horizontal cuts
    const areaOfFirstPiece = firstVerticalCutHeight * currentW;
    const halfWidthForRemaining = Math.floor(currentW / 2);
    const otherHalfWidthForRemaining = currentW - halfWidthForRemaining;
    const areaOfSecondPiece = remainingHeightForVerticalCuts * halfWidthForRemaining;
    const areaOfThirdPiece = remainingHeightForVerticalCuts * otherHalfWidthForRemaining;

    const areas = [areaOfFirstPiece, areaOfSecondPiece, areaOfThirdPiece];
    const maxArea = Math.max(...areas);
    const minArea = Math.min(...areas);

    localMinDiff = Math.min(localMinDiff, maxArea - minArea);
  }
  return localMinDiff;
}

function executeMainLogic() {
  const dimensionsInput = readIntegerArray();
  let heightVal = dimensionsInput[0];
  let widthVal = dimensionsInput[1];

  let minDifference = 100000000000;

  minDifference = computeMinDifference(heightVal, widthVal, minDifference);

  const tempDimension = heightVal;
  heightVal = widthVal;
  widthVal = tempDimension;

  minDifference = computeMinDifference(heightVal, widthVal, minDifference);

  printOutput(minDifference);
}
