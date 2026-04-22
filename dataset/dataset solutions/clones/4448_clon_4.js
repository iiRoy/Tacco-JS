class InputProcessor {
  #inputLines;
  #linePointer = 0;

  constructor(rawData) {
    this.#inputLines = rawData.trim().split('\n');
  }

  obtainNumericValue() {
    const currentLineData = this.#inputLines[this.#linePointer];
    this.#linePointer++;
    return Number(currentLineData.split(' ')[0]);
  }

  obtainNumericList() {
    const currentLineData = this.#inputLines[this.#linePointer];
    this.#linePointer++;
    return currentLineData.split(' ').map(Number);
  }
}

function processChallenge() {
  const AFFIRMATIVE = "Yes";
  const NEGATIVE = "No";

  const dataProcessor = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

  const totalElements = dataProcessor.obtainNumericValue();
  const elementCollection = dataProcessor.obtainNumericList();

  const elementCategories = elementCollection.reduce((tally, currentElement) => {
    const remainderValue = currentElement % 4;
    if (remainderValue === 0) {
      tally.multipleOfFour++;
    } else if (remainderValue === 2) {
      tally.evenButNotMultipleOfFour++;
    } else { // remainderValue === 1 or 3
      tally.oddModuloFour++;
    }
    return tally;
  }, { multipleOfFour: 0, evenButNotMultipleOfFour: 0, oddModuloFour: 0 });

  const { multipleOfFour, evenButNotMultipleOfFour, oddModuloFour } = elementCategories;

  if (totalElements === evenButNotMultipleOfFour) {
    return AFFIRMATIVE;
  }

  if (multipleOfFour === 0) {
    return NEGATIVE;
  }

  if (oddModuloFour <= multipleOfFour) {
    return AFFIRMATIVE;
  }

  return NEGATIVE;
}

console.log(processChallenge());