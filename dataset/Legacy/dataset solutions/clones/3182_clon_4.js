const fileSystem = require("fs");
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8").trim();
const rawInputLines = rawInputContent.split("\n");

class InputSource {
  constructor(lines) {
    this.sourceLines = lines;
    this.currentPosition = 0;
  }

  advanceAndFetch() {
    if (!this.hasMoreLines()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    return this.sourceLines[this.currentPosition++];
  }

  hasMoreLines() {
    return this.currentPosition < this.sourceLines.length;
  }
}

const programInput = new InputSource(rawInputLines);

const conversionOperations = new Map([
  [1, (val) => parseInt(val, 10)],
  [2, (val) => val.split(" ")],
  [4, (val) => val.split(" ").map(Number)],
  [6, (val) => val.split("")],
  [7, (val) => val.split("").map(Number)],
  [8, (val) => val.join(" ")],
  [9, (val) => val.join("\n")],
  [0, (val) => val.join("")],
]);

const applyConversion = (value, typeCode) => {
  try {
    const operation = conversionOperations.get(typeCode);
    return operation ? operation(value) : value;
  } catch (e) {
    return value;
  }
};

const obtainNextLine = () => programInput.advanceAndFetch();
const obtainNextInteger = () => applyConversion(obtainNextLine(), 1);
const obtainNextStringArray = () => applyConversion(obtainNextLine(), 2);
const obtainNextIntegerArray = () => applyConversion(obtainNextLine(), 4);
const obtainNextCharacterArray = () => applyConversion(obtainNextLine(), 6);
const checkMoreInput = () => programInput.hasMoreLines();

const displayOutput = (content) => console.log(content);
const displayError = (content) => console.error(content);

function executeMainLogic() {
  const [firstOperand, secondOperand] = obtainNextIntegerArray();

  const result = (secondOperand % firstOperand)
    ? (firstOperand + secondOperand)
    : (firstOperand - secondOperand);

  displayOutput(result);
}

executeMainLogic();
