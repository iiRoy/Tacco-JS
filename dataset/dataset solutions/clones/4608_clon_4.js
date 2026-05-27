class InputHandler {
  constructor() {
    this.sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    this.linePointer = 0;
  }

  hasMoreData() {
    return this.linePointer < this.sourceLines.length;
  }

  retrieveNextLine() {
    if (!this.hasMoreData()) {
      return "";
    }
    const currentLineContent = this.sourceLines[this.linePointer];
    this.linePointer++;
    return currentLineContent;
  }

  obtainInteger() {
    return parseInt(this.retrieveNextLine(), 10);
  }

  obtainStringArray() {
    return this.retrieveNextLine().split(" ");
  }

  obtainIntegerArray() {
    return this.retrieveNextLine().split(" ").map(Number);
  }

  obtainCharacterArray() {
    return this.retrieveNextLine().split("");
  }
}

const dataStream = new InputHandler();

function printOutput(content) {
  console.log(content);
}

function printError(content) {
  console.error(content);
}

function calculateTotalDuration() {
  const initialConfig = dataStream.obtainIntegerArray();
  const elementCount = initialConfig[0];
  const timeLimit = initialConfig[1];
  const timeSequence = dataStream.obtainIntegerArray();

  const accumulatedTime = timeSequence.slice(1).reduce((currentSum, currentMoment, idx) => {
    const priorMoment = timeSequence[idx];
    const actualInterval = currentMoment - priorMoment;
    return currentSum + Math.min(actualInterval, timeLimit);
  }, 0);

  const finalDuration = accumulatedTime + timeLimit;

  printOutput(finalDuration);
}

calculateTotalDuration();
