const inputSourceManager = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let bufferedInputLines = [];
let currentLinePointer = 0;

inputSourceManager.on('line', (incomingLine) => {
  bufferedInputLines.push(incomingLine);
});

inputSourceManager.on('close', () => {
  logDiagnostic("-----start-----");
  const programStartTime = new Date();
  executeMainProgram();
  const programEndTime = new Date() - programStartTime;
  logDiagnostic("----- end -----");
  logDiagnostic("time : " + (programEndTime) + "ms");
});

function obtainNextToken() {
  if (currentLinePointer >= bufferedInputLines.length) {
    throw new Error("ArrayIndexOutOfBoundsException これ以上ないよ");
  }
  return bufferedInputLines[currentLinePointer++];
}

function checkMoreTokens() {
  return currentLinePointer < bufferedInputLines.length;
}

function displayOutput(contentToDisplay) {
  console.log(contentToDisplay);
}

function logDiagnostic(diagnosticMessage) {
  console.error("debug:" + require("util").inspect(diagnosticMessage, false, null));
}

const typeConversionDispatch = {
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

function applyConversion(valueToConvert, conversionCode) {
  try {
    const converterFunction = typeConversionDispatch[conversionCode] || typeConversionDispatch.default;
    return converterFunction(valueToConvert);
  } catch (e) {
    return valueToConvert;
  }
}

function retrieveInteger() { return applyConversion(obtainNextToken(), 1); }
function retrieveStringArray() { return applyConversion(obtainNextToken(), 2); }
function retrieveIntegerArray() { return applyConversion(obtainNextToken(), 4); }
function retrieveCharacterArray() { return applyConversion(obtainNextToken(), 6); }

function executeMainProgram() {
  const truncationLimit = retrieveInteger();
  const sourceString = obtainNextToken();

  const finalOutput = sourceString.length <= truncationLimit
    ? sourceString
    : sourceString.slice(0, 7) + "...";

  displayOutput(finalOutput);
}
