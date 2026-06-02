const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

class InputProcessor {
  constructor(lines) {
    this.dataLines = lines;
    this.currentLineIndex = 0;
    this.totalLines = lines.length;
  }

  fetchNextLine() {
    if (!this.canFetchMore()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    const lineContent = this.dataLines[this.currentLineIndex];
    this.currentLineIndex++;
    return lineContent;
  }

  canFetchMore() {
    return this.currentLineIndex < this.totalLines;
  }
}

const inputReader = new InputProcessor(rawData);

function printResult(content) {
  console.log(content);
}

function logError(errorMessage) {
  console.error(errorMessage);
}

const convertToNumberArray = (arr) => arr.map(Number);
const convertToStringArray = (str) => str.split("");
const convertToNumberStringArray = (str) => str.split("").map(Number);

const conversionHandlers = {
  1: (val) => parseInt(val),
  2: (val) => val.split(" "),
  4: (val) => convertToNumberArray(val.split(" ")),
  6: (val) => convertToStringArray(val),
  7: (val) => convertToNumberStringArray(val),
  8: (val) => val.join(" "),
  9: (val) => val.join("\n"),
  0: (val) => val.join(""),
};

function processInputData(inputValue, conversionType) {
  try {
    const handler = conversionHandlers[conversionType];
    if (handler) {
      return handler(inputValue);
    }
    return inputValue;
  } catch (e) {
    return inputValue;
  }
}

function calculateGridValue(currentM, currentN, currentI, currentJ) {
  return (currentM * currentI) + (currentN * currentJ) - (2 * currentI * currentJ);
}

function isDirectlyDivisible(targetValue, divisorA, divisorB) {
    return targetValue % divisorA === 0 || targetValue % divisorB === 0;
}

function executeSolution() {
  const firstLineValues = processInputData(inputReader.fetchNextLine(), 4);
  const numN = firstLineValues[0];
  const numM = firstLineValues[1];
  const targetK = firstLineValues[2];

  if (isDirectlyDivisible(targetK, numM, numN)) {
    printResult("Yes");
    return;
  }

  for (let rowIdx = 1; rowIdx <= numN; rowIdx++) {
    for (let colIdx = 1; colIdx <= numM; colIdx++) {
      const currentSum = calculateGridValue(numM, numN, rowIdx, colIdx);
      if (currentSum === targetK) {
        printResult("Yes");
        return;
      }
    }
  }

  printResult("No");
}

executeSolution();
