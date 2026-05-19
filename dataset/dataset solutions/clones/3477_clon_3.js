const readlineModule = require('readline');
const utilModule = require('util');
const standardInput = process.stdin;
const standardOutput = process.stdout;

const inputReader = readlineModule.createInterface({
  input: standardInput,
  output: standardOutput
});

let inputDataHandler;
const inputLinesBuffer = [];

inputReader.on('line', (currentLine) => {
  inputLinesBuffer.push(currentLine);
});

inputReader.on('close', () => {
  inputDataHandler = initializeInputHandler(inputLinesBuffer);
  console.error("\n");
  const executionStartTime = Date.now();
  executeMainLogic();
  const executionDuration = Date.now() - executionStartTime;
  const KILOBYTE_CONVERSION_FACTOR = 1024;
  const memoryUsageKB = Math.round(process.memoryUsage().heapTotal / KILOBYTE_CONVERSION_FACTOR);

  printDebugError(`time : ${executionDuration}ms`);
  printDebugError(`memory : ${memoryUsageKB}KB`);
});

const createDeepCopy = (sourceObject) => {
  const serialized = JSON.stringify(sourceObject);
  return JSON.parse(serialized);
};

const getNextInputLine = () => inputDataHandler.next();
const hasMoreInput = () => inputDataHandler.hasNext();

const readNextInt = () => convertInput(getNextInputLine(), 1);
const readNextStringArray = () => convertInput(getNextInputLine(), 2);
const readNextIntArray = () => convertInput(getNextInputLine(), 4);
const readNextCharArray = () => convertInput(getNextInputLine(), 6);

const initializeInputHandler = (inputSourceList) => {
  const handlerState = {
    dataList: inputSourceList,
    currentIndex: 0,
    maximumIndex: inputSourceList.length
  };

  const checkHasMore = () => handlerState.currentIndex < handlerState.maximumIndex;

  const retrieveNextLine = () => {
    if (checkHasMore()) {
      const currentLineValue = handlerState.dataList[handlerState.currentIndex];
      handlerState.currentIndex++;
      return currentLineValue;
    } else {
      throw "ArrayIndexOutOfBoundsException ‚There is no more input";
    }
  };

  return {
    hasNext: checkHasMore,
    next: retrieveNextLine
  };
};

const printOutput = (message) => {
  console.log(message);
};

const printDebugError = (debugMessage) => {
  const inspectionOptions = { showHidden: false, depth: null };
  const inspectedMessage = utilModule.inspect(debugMessage, inspectionOptions.showHidden, inspectionOptions.depth);
  console.error(`debug:${inspectedMessage}`);
};

const convertInput = (inputValue, conversionType) => {
  try {
    const spaceDelimiter = " ";
    const noDelimiter = "";
    const newlineDelimiter = "\n";

    switch (conversionType) {
      case 1:
        return parseInt(inputValue, 10);
      case 2:
        return inputValue.split(spaceDelimiter);
      case 4:
        const spaceSplitNumbers = inputValue.split(spaceDelimiter);
        return spaceSplitNumbers.map(Number);
      case 6:
        return inputValue.split(noDelimiter);
      case 7:
        const charSplitNumbers = inputValue.split(noDelimiter);
        return charSplitNumbers.map(Number);
      case 8:
        return inputValue.join(spaceDelimiter);
      case 9:
        return inputValue.join(newlineDelimiter);
      case 0:
        return inputValue.join(noDelimiter);
      default:
        return inputValue;
    }
  } catch (conversionError) {
    return inputValue;
  }
};

const executeMainLogic = () => {
  const confirmationMessage = "Yes";
  const outputValues = [
    confirmationMessage,
    4,
    "3 1 2 3",
    "3 1 4 5",
    "3 2 5 6",
    "3 3 4 6"
  ];

  for (const valueToPrint of outputValues) {
    printOutput(valueToPrint);
  }
};
