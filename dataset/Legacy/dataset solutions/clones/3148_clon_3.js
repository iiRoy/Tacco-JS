const fs = require("fs");
const INPUT_FILE_PATH = "/dev/stdin";

class InputProcessor {
  constructor(lines) {
    this.dataLines = lines;
    this.currentLineIdx = 0;
    this.totalLines = lines.length;
  }

  fetchNextLine() {
    if (!this.canReadNext()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    const lineContent = this.dataLines[this.currentLineIdx];
    this.currentLineIdx++;
    return lineContent;
  }

  canReadNext() {
    return (this.currentLineIdx < this.totalLines);
  }
}

const rawDataLines = fs.readFileSync(INPUT_FILE_PATH, "utf8").trim().split("\n");
const inputReaderInstance = new InputProcessor(rawDataLines);

function readNextInput() { return inputReaderInstance.fetchNextLine(); }
function hasMoreInput() { return inputReaderInstance.canReadNext(); }

function printOutput(text) { console.log(text); }
function printError(text) { console.error(text); }

const CONVERSION_STRATEGIES = {
  1: (val) => parseInt(val),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  8: (val) => val.join(" "),
  9: (val) => val.join("\n"),
  0: (val) => val.join(""),
  DEFAULT: (val) => val
};

function convertInput(value, conversionType) {
  try {
    const strategy = CONVERSION_STRATEGIES[conversionType] || CONVERSION_STRATEGIES.DEFAULT;
    return strategy(value);
  } catch (e) {
    return value;
  }
}

const isOdd = (num) => num % 2 !== 0;

function calculateXORSumForRange(startNum, endNum) {
  if (startNum === endNum) {
    return startNum;
  }

  const startIsOdd = isOdd(startNum);
  const endIsOdd = isOdd(endNum);

  let intermediateCount;
  let resultXORValue;

  const parityIndicator = (startIsOdd ? 2 : 0) + (endIsOdd ? 1 : 0);

  switch (parityIndicator) {
    case 2: // Odd, Even (startIsOdd && !endIsOdd)
      intermediateCount = (endNum - startNum - 1) / 2;
      resultXORValue = startNum ^ endNum ^ (intermediateCount % 2);
      break;
    case 3: // Odd, Odd (startIsOdd && endIsOdd)
      intermediateCount = (endNum - startNum) / 2;
      resultXORValue = startNum ^ (intermediateCount % 2);
      break;
    case 0: // Even, Even (!startIsOdd && !endIsOdd)
      intermediateCount = (endNum - startNum) / 2;
      resultXORValue = endNum ^ (intermediateCount % 2);
      break;
    case 1: // Even, Odd (!startIsOdd && endIsOdd)
      intermediateCount = (endNum - startNum + 1) / 2;
      resultXORValue = intermediateCount % 2;
      break;
  }
  return resultXORValue;
}

function executeMainLogic() {
  const firstLineNumbers = convertInput(readNextInput(), 4);
  const numA = firstLineNumbers[0];
  const numB = firstLineNumbers[1];

  if (numA === numB) {
    printOutput(numA);
    return;
  }

  const finalResult = calculateXORSumForRange(numA, numB);
  printOutput(finalResult);
}

executeMainLogic();
