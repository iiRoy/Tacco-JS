class InputProcessor {
  #sourceLines;
  #lineIndex;
  #conversionMap;

  constructor(rawInput) {
    this.#sourceLines = rawInput.trim().split("\n");
    this.#lineIndex = 0;
    this.#conversionMap = new Map([
      [1, (val) => parseInt(val, 10)],
      [2, (val) => val.split(" ")],
      [4, (val) => val.split(" ").map(Number)],
      [6, (val) => val.split("")],
      [7, (val) => val.split("").map(Number)],
      [8, (val) => val.join(" ")],
      [9, (val) => val.join("\n")],
      [0, (val) => val.join("")],
    ]);
  }

  #retrieveNextLine() {
    if (this.#lineIndex >= this.#sourceLines.length) {
      return "";
    }
    return this.#sourceLines[this.#lineIndex++];
  }

  #processConversion(value, typeCode) {
    const converter = this.#conversionMap.get(typeCode);
    if (converter) {
      try {
        return converter(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  }

  fetchInteger() {
    return this.#processConversion(this.#retrieveNextLine(), 1);
  }

  fetchStringArray() {
    return this.#processConversion(this.#retrieveNextLine(), 2);
  }

  fetchIntegerArray() {
    return this.#processConversion(this.#retrieveNextLine(), 4);
  }

  fetchCharacterArray() {
    return this.#processConversion(this.#retrieveNextLine(), 6);
  }

  fetchNumericCharacterArray() {
    return this.#processConversion(this.#retrieveNextLine(), 7);
  }

  outputResult(content) {
    console.log(content);
  }

  outputError(content) {
    console.error(content);
  }
}

function solveProblem() {
  const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
  const dataStream = new InputProcessor(rawInputContent);

  const itemQuantity = dataStream.fetchInteger();
  const primaryValues = dataStream.fetchIntegerArray();
  const secondaryValues = dataStream.fetchIntegerArray();

  let netDifference = 0;
  let totalDeficit = 0;
  let initialFixes = 0;
  const excessContributions = [];

  primaryValues.forEach((valA, idx) => {
    const currentDelta = valA - secondaryValues[idx];
    netDifference += currentDelta;

    if (currentDelta < 0) {
      totalDeficit += Math.abs(currentDelta);
      initialFixes++;
    } else {
      excessContributions.push(currentDelta);
    }
  });

  if (netDifference < 0) {
    dataStream.outputResult(-1);
    return;
  }

  excessContributions.sort((valX, valY) => valY - valX);

  let remainingDeficit = totalDeficit;
  let additionalFixes = 0;

  additionalFixes = excessContributions.reduce((acc, currentSurplus) => {
    if (remainingDeficit <= 0) {
      return acc;
    }
    remainingDeficit -= currentSurplus;
    return acc + 1;
  }, 0);

  dataStream.outputResult(initialFixes + additionalFixes);
}

solveProblem();
