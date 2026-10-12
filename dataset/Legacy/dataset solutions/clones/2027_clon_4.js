class InputHandler {
  #sourceLines;
  #currentLineIndex;

  constructor() {
    this.#sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    this.#currentLineIndex = 0;
  }

  hasMoreLines() {
    return this.#currentLineIndex < this.#sourceLines.length;
  }

  fetchNextLine() {
    if (!this.hasMoreLines()) {
      return "";
    }
    return this.#sourceLines[this.#currentLineIndex++];
  }

  retrieveInteger() {
    return Number.parseInt(this.fetchNextLine());
  }

  retrieveStringArray() {
    return this.fetchNextLine().split(" ");
  }

  retrieveIntegerArray() {
    return this.fetchNextLine().split(" ").map(Number);
  }

  retrieveCharacterArray() {
    return this.fetchNextLine().split("");
  }
}

function displayResult(content) {
  console.log(content);
}

function logDiagnostic(content) {
  console.error(content);
}

function executeCalculation() {
  const inputReader = new InputHandler();

  const firstLineData = inputReader.retrieveIntegerArray();
  const circumference = firstLineData[0];
  const pointCount = firstLineData[1];

  const pointPositions = inputReader.retrieveIntegerArray();

  const allGaps = Array.from({ length: pointCount }, (_, idx) => {
    if (idx < pointCount - 1) {
      return pointPositions[idx + 1] - pointPositions[idx];
    } else {
      return (circumference - pointPositions[pointCount - 1]) + pointPositions[0];
    }
  });

  logDiagnostic(allGaps);

  const maximumGap = Math.max(...allGaps);

  const finalSum = circumference - maximumGap;

  displayResult(finalSum);
}

executeCalculation();
