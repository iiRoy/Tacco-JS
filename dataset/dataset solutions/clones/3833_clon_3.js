const FILE_PATH = "/dev/stdin";
const rawInputData = require("fs").readFileSync(FILE_PATH, "utf8");
const processedInputLines = rawInputData.trim().split("\n");

const NO_SUCH_ELEMENT_MSG = "NoSuchElementException:次に要素は無いよ";

class InputLineIterator {
  constructor(lines) {
    this.dataLines = lines;
    this.currentLineIndex = 0;
    this.totalLines = lines.length;
  }

  hasMoreLines() {
    return this.currentLineIndex < this.totalLines;
  }

  fetchNextLine() {
    if (!this.hasMoreLines()) {
      throw NO_SUCH_ELEMENT_MSG;
    }
    const lineContent = this.dataLines[this.currentLineIndex];
    this.currentLineIndex++;
    return lineContent;
  }
}

const inputHandler = new InputLineIterator(processedInputLines);

function getNextInputLine() {
  return inputHandler.fetchNextLine();
}

function parseNextInt() {
  return convertInput(getNextInputLine(), 1);
}

function parseNextStrArray() {
  return convertInput(getNextInputLine(), 2);
}

function parseNextIntArray() {
  return convertInput(getNextInputLine(), 4);
}

function parseNextCharArray() {
  return convertInput(getNextInputLine(), 6);
}

function hasMoreInput() {
  return inputHandler.hasMoreLines();
}

function printOutput(content) {
  console.log(content);
}

function printError(content) {
  console.error(content);
}

const stringToNumber = (s) => Number(s);
const splitBySpace = (s) => s.split(" ");
const splitByChar = (s) => s.split("");

function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return splitBySpace(inputValue);
      case 4:
        return splitBySpace(inputValue).map(stringToNumber);
      case 6:
        return splitByChar(inputValue);
      case 7:
        return splitByChar(inputValue).map(stringToNumber);
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

class DisjointSetUnion {
  constructor(size) {
    this.parentOrSize = new Array(size).fill(-1);
  }

  areConnected(elementA, elementB) {
    return this.findRoot(elementA) === this.findRoot(elementB);
  }

  findRoot(elementIndex) {
    if (this.parentOrSize[elementIndex] < 0) {
      return elementIndex;
    } else {
      this.parentOrSize[elementIndex] = this.findRoot(this.parentOrSize[elementIndex]);
      return this.parentOrSize[elementIndex];
    }
  }

  uniteSets(elementA, elementB) {
    let rootA = this.findRoot(elementA);
    let rootB = this.findRoot(elementB);

    if (!this.areConnected(rootA, rootB)) {
      if (rootA >= rootB) {
        this.parentOrSize[rootA] += this.parentOrSize[rootB];
        this.parentOrSize[rootB] = rootA;
      } else {
        this.parentOrSize[rootB] += this.parentOrSize[rootA];
        this.parentOrSize[rootA] = rootB;
      }
    }
  }

  getSetSize(elementIndex) {
    return -this.parentOrSize[this.findRoot(elementIndex)];
  }
}

executeProgram();

function executeProgram() {
  const firstLineParams = parseNextIntArray();
  const numElements = firstLineParams[0];
  const numOperations = firstLineParams[1];

  const initialMapping = parseNextIntArray();

  const dsuStructure = new DisjointSetUnion(numElements);

  for (let k = 0; k < numOperations; k++) {
    const operationPair = parseNextIntArray();
    const firstElement = operationPair[0] - 1;
    const secondElement = operationPair[1] - 1;
    dsuStructure.uniteSets(firstElement, secondElement);
  }

  let matchingCount = 0;
  for (let idx = 0; idx < numElements; idx++) {
    const mappedValue = initialMapping[idx] - 1;
    if (dsuStructure.areConnected(mappedValue, idx)) {
      matchingCount++;
    }
  }

  printOutput(matchingCount);
}
