const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

class InputProcessor {
  constructor(lines) {
    this.dataLines = lines;
    this.currentLineIndex = 0;
    this.totalLines = lines.length;
  }

  canAdvance() {
    return (this.currentLineIndex < this.totalLines);
  }

  fetchNextLine() {
    if (!this.canAdvance()) {
      return "";
    }
    const nextLine = this.dataLines[this.currentLineIndex];
    this.currentLineIndex++;
    return nextLine;
  }
}

const inputHandler = new InputProcessor(rawInputData);

const InputReader = {
  getNextInputLine: () => inputHandler.fetchNextLine(),
  hasMoreInput: () => inputHandler.canAdvance(),
  parseNextInteger: () => convertInputData(InputReader.getNextInputLine(), 1),
  parseNextStringArray: () => convertInputData(InputReader.getNextInputLine(), 2),
  parseNextIntegerArray: () => convertInputData(InputReader.getNextInputLine(), 4),
  parseNextCharacterArray: () => convertInputData(InputReader.getNextInputLine(), 6),
};

const printToStdout = (content) => console.log(content);
const printToStderr = (content) => console.error(content);

const conversionStrategies = {
  1: (val) => parseInt(val),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map((item) => Number(item)),
  6: (val) => val.split(""),
  7: (val) => val.split("").map((item) => Number(item)),
  8: (val) => val.join(" "),
  9: (val) => val.join("\n"),
  0: (val) => val.join(""),
};

function convertInputData(inputValue, conversionType) {
  try {
    const strategy = conversionStrategies[conversionType];
    if (strategy) {
      return strategy(inputValue);
    }
    return inputValue;
  } catch (error) {
    return inputValue;
  }
}

function calculatePairResult(valueA, valueB) {
  if (valueA > valueB) {
    return valueA - valueB;
  } else if (valueA < valueB) {
    return valueB - valueA;
  } else {
    return valueA;
  }
}

function executeMainLogic() {
  const initialSize = InputReader.parseNextInteger();
  const initialArrayLength = Math.pow(2, initialSize);

  let currentValues = Array.from({ length: initialArrayLength }, () => InputReader.parseNextInteger());

  for (let iterationCount = 0; iterationCount < initialSize; iterationCount++) {
    const nextIterationLength = Math.pow(2, initialSize - iterationCount - 1);
    const nextIterationValues = new Array(nextIterationLength);

    for (let pairStartIndex = 0; pairStartIndex < currentValues.length; pairStartIndex += 2) {
      const val1 = currentValues[pairStartIndex];
      const val2 = currentValues[pairStartIndex + 1];
      nextIterationValues[pairStartIndex / 2] = calculatePairResult(val1, val2);
    }
    currentValues = nextIterationValues;
    // printToStderr(currentValues);
  }
  printToStdout(currentValues[0]);
}

executeMainLogic();
