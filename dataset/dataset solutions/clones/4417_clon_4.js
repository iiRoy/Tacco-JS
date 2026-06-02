const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let capturedLines = [];
inputReader.on('line', (currentLine) => { capturedLines.push(currentLine); });
inputReader.on('close', () => {
  const lineIterator = createLineIterator(capturedLines);
  logDiagnostic("-----begin-----");
  const operationStart = new Date();
  processInputAndCalculate(lineIterator);
  const operationEnd = new Date() - operationStart;
  logDiagnostic("----- finish -----");
  logDiagnostic("duration : " + (operationEnd) + "ms");
  logDiagnostic("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createLineIterator(linesArray) {
  let currentPosition = 0;
  const totalLines = linesArray.length;

  return {
    retrieveNext: () => {
      if (currentPosition >= totalLines) {
        throw new Error("NoMoreInputException: All input lines consumed.");
      }
      return linesArray[currentPosition++];
    },
    hasMore: () => currentPosition < totalLines
  };
}

function displayResult(content) {
  console.log(content);
}

function logDiagnostic(message) {
  console.error("diagnostic:" + require("util").inspect(message, false, null));
}

function dataTransformer(inputItem, transformationKey) {
  const transformationMap = new Map([
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (val) => val.join(" ")],
    [9, (val) => val.join("\n")],
    [0, (val) => val.join("")]
  ]);

  try {
    const transformFunction = transformationMap.get(transformationKey);
    return transformFunction ? transformFunction(inputItem) : inputItem;
  } catch (e) {
    return inputItem;
  }
}

function processInputAndCalculate(lineIterator) {
  const getNextLine = () => lineIterator.retrieveNext();
  const checkMoreLines = () => lineIterator.hasMore();

  const parseInteger = () => dataTransformer(getNextLine(), 1);
  const getNumericArrayFromNextLine = () => dataTransformer(getNextLine(), 4);
  const getCharacterArrayFromNextLine = () => dataTransformer(getNextLine(), 6);
  const getStringArrayFromNextLine = () => dataTransformer(getNextLine(), 2);

  const inputNumbers = getNumericArrayFromNextLine();
  const firstIntervalStart = inputNumbers[0];
  const firstIntervalEnd = inputNumbers[1];
  const secondIntervalStart = inputNumbers[2];
  const secondIntervalEnd = inputNumbers[3];

  const intersectionStart = Math.max(firstIntervalStart, secondIntervalStart);
  const intersectionEnd = Math.min(firstIntervalEnd, secondIntervalEnd);

  const overlapLength = Math.max(0, intersectionEnd - intersectionStart);

  displayResult(overlapLength);
}
