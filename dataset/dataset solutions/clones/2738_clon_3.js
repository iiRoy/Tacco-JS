const inspectUtil = require("util").inspect;

class InputProcessor {
  constructor(lines) {
    this.lineList = lines;
    this.currentIndex = 0;
    this.maxLines = lines.length;
  }

  hasMoreLines() {
    return this.currentIndex < this.maxLines;
  }

  getNextLine() {
    if (!this.hasMoreLines()) {
      throw "ArrayIndexOutOfBoundsException これ以上ないよ";
    }
    const currentInput = this.lineList[this.currentIndex];
    this.currentIndex++;
    return currentInput;
  }
}

let dataHandlerInstance;
const collectedInputLines = [];

const printOutput = (message) => console.log(message);
const printDebug = (debugMessage) => console.error("debug:" + inspectUtil(debugMessage, false, null));

const conversionFunctions = {
  1: (val) => parseInt(val, 10),
  2: (val) => val.split(" "),
  4: (val) => val.split(" ").map(Number),
  6: (val) => val.split(""),
  7: (val) => val.split("").map(Number),
  8: (arr) => arr.join(" "),
  9: (arr) => arr.join("\n"),
  0: (arr) => arr.join(""),
  default: (val) => val,
};

const convertInput = (inputValue, conversionType) => {
  try {
    const converter = conversionFunctions[conversionType] || conversionFunctions.default;
    return converter(inputValue);
  } catch (e) {
    return inputValue;
  }
};

const readNextInteger = () => convertInput(getNextInputLine(), 1);
const readNextStringArray = () => convertInput(getNextInputLine(), 2);
const readNextIntegerArray = () => convertInput(getNextInputLine(), 4);
const readNextCharacterArray = () => convertInput(getNextInputLine(), 6);
const getNextInputLine = () => dataHandlerInstance.getNextLine();
const hasMoreInput = () => dataHandlerInstance.hasMoreLines();

const deepCloneObject = (sourceObj) => JSON.parse(JSON.stringify(sourceObj));

const handleInputClose = () => {
  dataHandlerInstance = new InputProcessor(collectedInputLines);
  console.error("\n");
  const startTime = new Date();
  executeMainLogic();
  const endTime = new Date() - startTime;

  printDebug(`time : ${endTime}ms`);
  printDebug(`memory : ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
};

const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (inputLine) => collectedInputLines.push(inputLine));
inputReader.on('close', handleInputClose);

const calculateAffectedSum = (currentBaseIndex, arraySize, toggleStatesArray) => {
  let sumOfAffectedStates = 0;
  const baseValue = currentBaseIndex + 1;
  for (let multiplier = 1; multiplier * baseValue <= arraySize; multiplier++) {
    const targetIndex = (multiplier * baseValue) - 1;
    sumOfAffectedStates += toggleStatesArray[targetIndex];
  }
  return sumOfAffectedStates;
};

const needsStateToggle = (currentSum, expectedState) => {
  return (currentSum % 2) !== (expectedState % 2);
};

const getToggledBallIndices = (toggleStatesArray) => {
  const indices = [];
  for (let i = 0; i < toggleStatesArray.length; i++) {
    if (toggleStatesArray[i] === 1) {
      indices.push(i + 1);
    }
  }
  return indices;
};

function executeMainLogic() {
  const arraySize = readNextInteger();
  const initialStates = readNextIntegerArray();
  const toggleStates = Array.from({ length: arraySize }, () => 0);

  for (let i = arraySize - 1; i >= 0; i--) {
    const currentSum = calculateAffectedSum(i, arraySize, toggleStates);
    const expectedState = initialStates[i];

    if (needsStateToggle(currentSum, expectedState)) {
      toggleStates[i]++;
    }
  }

  const resultIndices = getToggledBallIndices(toggleStates);
  printOutput(resultIndices.length);

  if (resultIndices.length > 0) {
    const formattedOutput = convertInput(resultIndices, 8);
    printOutput(formattedOutput);
  }
}
