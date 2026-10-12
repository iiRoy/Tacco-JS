var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

class InputProcessor {
  constructor(lines) {
    this.dataLines = lines;
    this.currentLineIndex = 0;
    this.totalLines = lines.length;
  }

  readNextLine() {
    if (!this.hasMoreLines()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    const lineContent = this.dataLines[this.currentLineIndex];
    this.currentLineIndex++;
    return lineContent;
  }

  hasMoreLines() {
    return this.currentLineIndex < this.totalLines;
  }
}

const inputReader = new InputProcessor(rawData);

function getNextInputLine() {
  return inputReader.readNextLine();
}

function canReadMoreLines() {
  return inputReader.hasMoreLines();
}

function printOutput(message) {
  console.log(message);
}

function printError(errorMessage) {
  console.error(errorMessage);
}

const conversionHandlers = {
  1: (val) => parseInt(val),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map((a) => Number(a)),
  6: (val) => val.split(""),
  7: (val) => val.split("").map((a) => Number(a)),
  8: (val) => val.join(" "),
  9: (val) => val.join("\n"),
  0: (val) => val.join(""),
};

function processInputData(inputValue, conversionType) {
  try {
    if (conversionType === undefined || conversionType === null || !conversionHandlers.hasOwnProperty(conversionType)) {
      return inputValue;
    }
    return conversionHandlers[conversionType](inputValue);
  } catch (e) {
    return inputValue;
  }
}

function countHashesInGrid(grid, h, w) {
  let currentHashCount = 0;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (grid[r][c] === "#") {
        currentHashCount++;
      }
    }
  }
  return currentHashCount;
}

function executeMainLogic() {
  const firstLineData = processInputData(getNextInputLine(), 4);
  const heightVal = firstLineData[0];
  const widthVal = firstLineData[1];

  const gridData = [];
  for (let rowIndex = 0; rowIndex < heightVal; rowIndex++) {
    gridData.push(processInputData(getNextInputLine(), 6));
  }

  const hashCount = countHashesInGrid(gridData, heightVal, widthVal);

  const requiredHashCount = heightVal + widthVal - 1;

  if (hashCount === requiredHashCount) {
    printOutput("Possible");
  } else {
    printOutput("Impossible");
  }
}

executeMainLogic();
