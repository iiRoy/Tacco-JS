var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const createInputHandler = (sourceLines) => {
  let currentLineIndex = 0;
  const totalLinesCount = sourceLines.length;

  const ensureNextElementExists = () => {
    if (currentLineIndex >= totalLinesCount) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
  };

  return {
    get: () => {
      ensureNextElementExists();
      const lineContent = sourceLines[currentLineIndex];
      currentLineIndex++;
      return lineContent;
    },
    has: () => currentLineIndex < totalLinesCount,
  };
};

const inputProcessor = createInputHandler(rawData);

function getNextLine(){return inputProcessor.get();}
function hasMoreLines(){return inputProcessor.has();}
function printOutput(message){console.log(message);}
function printError(message){console.error(message);}

const conversionStrategies = {
  1: (val) => parseInt(val),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  8: (arr) => arr.join(" "),
  9: (arr) => arr.join("\n"),
  0: (arr) => arr.join(""),
  default: (val) => val,
};

function convertInput(inputValue, conversionType) {
  try {
    const strategy = conversionStrategies[conversionType] || conversionStrategies.default;
    return strategy(inputValue);
  } catch (e) {
    return inputValue;
  }
}

executeProgram();

function executeProgram() {
  const dimensionsInput = convertInput(getNextLine(), 4);
  const gridHeight = dimensionsInput[0];
  const gridWidth = dimensionsInput[1];

  const gridMap = Array.from({ length: gridHeight }, () => convertInput(getNextLine(), 6));

  let currentY = gridHeight - 1;
  let currentX = gridWidth - 1;

  const isAtStart = (yCoord, xCoord) => yCoord === 0 && xCoord === 0;
  const isWithinGridBounds = (yCoord, xCoord) => yCoord >= 0 && yCoord < gridHeight && xCoord >= 0 && xCoord < gridWidth;
  const isPathSegmentClear = (yCoord, xCoord) => isWithinGridBounds(yCoord, xCoord) && gridMap[yCoord][xCoord] === "#";

  while (!isAtStart(currentY, currentX)) {
    printError(`${currentX} ${currentY}`);

    const canAttemptMoveUp = currentY > 0;
    const canAttemptMoveLeft = currentX > 0;

    const pathSegmentUpClear = canAttemptMoveUp && isPathSegmentClear(currentY - 1, currentX);
    const pathSegmentLeftClear = canAttemptMoveLeft && isPathSegmentClear(currentY, currentX - 1);

    if (currentX === 0) { // Only vertical movement is possible
      if (pathSegmentUpClear) {
        currentY--;
        continue;
      } else {
        printOutput("Impossible");
        return;
      }
    }

    if (currentY === 0) { // Only horizontal movement is possible
      if (pathSegmentLeftClear) {
        currentX--;
        continue;
      } else {
        printOutput("Impossible");
        return;
      }
    }

    // Both directions are potentially available.
    // The rule is: exactly one of the two adjacent cells must be '#' (clear path)
    // and the other must be '.' (blocked path).
    const exactlyOnePathOptionClear = (pathSegmentUpClear && !pathSegmentLeftClear) || (!pathSegmentUpClear && pathSegmentLeftClear);

    if (exactlyOnePathOptionClear) {
      if (pathSegmentUpClear) {
        currentY--;
      } else { // Must be pathSegmentLeftClear
        currentX--;
      }
      continue;
    } else {
      printOutput("Impossible");
      return;
    }
  }
  printOutput("Possible");
}
