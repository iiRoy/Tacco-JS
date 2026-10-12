const fileSystem = require("fs");

class InputSourceManager {
  #lineBuffer;
  #currentLineIndex;

  constructor(sourcePath) {
    this.#lineBuffer = fileSystem.readFileSync(sourcePath, "utf8").trim().split("\n");
    this.#currentLineIndex = 0;
  }

  hasMoreLines() {
    return this.#currentLineIndex < this.#lineBuffer.length;
  }

  fetchNextLine() {
    if (!this.hasMoreLines()) {
      return "";
    }
    const retrievedLine = this.#lineBuffer[this.#currentLineIndex];
    this.#currentLineIndex++;
    return retrievedLine;
  }
}

const dataReader = new InputSourceManager("/dev/stdin");

const conversionRegistry = {
  1: (val) => parseInt(val, 10),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  8: (val) => val.join(" "),
  9: (val) => val.join("\n"),
  0: (val) => val.join(""),
  default: (val) => val
};

function processConversion(inputValue, conversionCode) {
  try {
    const converter = conversionRegistry[conversionCode] || conversionRegistry.default;
    return converter(inputValue);
  } catch (error) {
    return inputValue;
  }
}

function next() { return dataReader.fetchNextLine(); }
function nextInt() { return processConversion(next(), 1); }
function nextStrArray() { return processConversion(next(), 2); }
function nextIntArray() { return processConversion(next(), 4); }
function nextCharArray() { return processConversion(next(), 6); }
function hasNext() { return dataReader.hasMoreLines(); }
function myout(content) { console.log(content); }
function myerr(content) { console.error(content); }

function mainExecution() {
  const initialDimension = nextInt();
  const initialCollectionSize = Math.pow(2, initialDimension);
  const startingElements = Array.from({ length: initialCollectionSize }, () => nextInt());

  const determinePairOutcome = (firstVal, secondVal) =>
    (firstVal === secondVal) ? firstVal : Math.abs(firstVal - secondVal);

  const recursiveReduction = (currentElements, remainingStages) => {
    if (remainingStages === 0) {
      return currentElements[0];
    }

    const nextStageElements = Array.from({ length: currentElements.length / 2 }, (_, idx) => {
      const elementA = currentElements[idx * 2];
      const elementB = currentElements[idx * 2 + 1];
      return determinePairOutcome(elementA, elementB);
    });

    return recursiveReduction(nextStageElements, remainingStages - 1);
  };

  const finalComputedValue = recursiveReduction(startingElements, initialDimension);
  myout(finalComputedValue);
}

mainExecution();
