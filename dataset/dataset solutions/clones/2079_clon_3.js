var dataStreamProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var parsedInputSource;
var incomingLineBuffer = [];

dataStreamProcessor.on('line', function(singleLine){
  incomingLineBuffer.push(singleLine);
});

dataStreamProcessor.on('close', function(){
  parsedInputSource = setupDataReader(incomingLineBuffer);

  console.error("--- Application Start ---");

  var executionStartTime = Date.now();

  executePrimaryLogic();

  var totalExecutionDuration = Date.now() - executionStartTime;
  logDiagnosticInfo("Execution Time: " + totalExecutionDuration + "ms");

  const totalHeapKB = Math.round(process.memoryUsage().heapTotal / 1024);
  logDiagnosticInfo("Memory Usage: " + totalHeapKB + "KB");
  console.error("--- Application End ---");
});

function deepCopyObject(originalObject){
  if (originalObject === null || typeof originalObject !== 'object') {
    return originalObject;
  }
  if (typeof structuredClone === 'function') {
    return structuredClone(originalObject);
  } else {
    return JSON.parse(JSON.stringify(originalObject));
  }
}

function fetchNextInteger(){
  return applyConversion(advanceAndFetch(), 1);
}

function retrieveNextStringArray(){
  return applyConversion(advanceAndFetch(), 2);
}

function extractNextNumericList(){
  return applyConversion(advanceAndFetch(), 4);
}

function segmentNextToChars(){
  return applyConversion(advanceAndFetch(), 6);
}

function advanceAndFetch(){
  if (!parsedInputSource || !parsedInputSource.canProceed()) {
    logDiagnosticInfo("Attempted to read beyond input bounds.");
    throw new Error("InputOutOfBounds: No more data available for processing.");
  }
  return parsedInputSource.pullNextItem();
}

function moreInputAvailable(){
  return parsedInputSource.canProceed();
}

function setupDataReader(sourceLines){
  if (!Array.isArray(sourceLines)) {
    logDiagnosticInfo("Error: Input for setupDataReader must be an array. Received: " + typeof sourceLines);
    throw new TypeError("Invalid argument: sourceLines must be an array.");
  }

  return {
    sourceData : sourceLines,
    currentPosition : 0,
    dataLength : sourceLines.length,

    canProceed : function(){
      return (this.currentPosition < this.dataLength);
    },

    pullNextItem : function(){
      if(this.canProceed()){
        const nextLine = this.sourceData[this.currentPosition];
        this.currentPosition++;
        return nextLine;
      } else {
        throw new Error("EndOfInputException: All input lines have been consumed.");
      }
    }
  };
}

function displayOutput(message){
  console.log(message);
}

function logDiagnosticInfo(dataToInspect){
  console.error("DIAGNOSTIC_LOG: " + require("util").inspect(dataToInspect, { showHidden: false, depth: 3, colors: true }));
}

function applyConversion(inputValue, conversionMode){
  try {
    let processedResult;
    switch(conversionMode){
      case 1:
        processedResult = parseInt(inputValue, 10);
        break;
      case 2:
        processedResult = inputValue.split(" ");
        break;
      case 4:
        processedResult = inputValue.split(" ").map(Number);
        break;
      case 6:
        processedResult = inputValue.split("");
        break;
      case 7:
        processedResult = inputValue.split("").map(Number);
        break;
      case 8:
        if (Array.isArray(inputValue)) {
          processedResult = inputValue.join(" ");
        } else {
          logDiagnosticInfo(`Warning: Attempted to join non-array with mode 8. Input: ${inputValue}`);
          processedResult = String(inputValue);
        }
        break;
      case 9:
        if (Array.isArray(inputValue)) {
          processedResult = inputValue.join("\n");
        } else {
          logDiagnosticInfo(`Warning: Attempted to join non-array with mode 9. Input: ${inputValue}`);
          processedResult = String(inputValue);
        }
        break;
      case 0:
        if (Array.isArray(inputValue)) {
          processedResult = inputValue.join("");
        } else {
          logDiagnosticInfo(`Warning: Attempted to join non-array with mode 0. Input: ${inputValue}`);
          processedResult = String(inputValue);
        }
        break;
      default:
        logDiagnosticInfo(`Unhandled conversion mode: ${conversionMode}. Returning original input.`);
        processedResult = inputValue;
        break;
    }
    return processedResult;
  } catch(conversionError){
    logDiagnosticInfo("Conversion failed for input: '" + inputValue + "' with mode: " + conversionMode + ". Error: " + conversionError.message);
    return inputValue;
  }
}

function executePrimaryLogic(){
  displayOutput("--- Starting Core Processing ---");

  if (!moreInputAvailable()) {
    logDiagnosticInfo("No input lines available to process in executePrimaryLogic.");
    displayOutput("No input provided. Exiting.");
    return;
  }

  const numberOfIterations = fetchNextInteger();

  if (isNaN(numberOfIterations) || numberOfIterations <= 0) {
    logDiagnosticInfo(`Invalid number of iterations received: ${numberOfIterations}. Must be a positive integer.`);
    displayOutput("Invalid input for number of iterations. Exiting.");
    return;
  }

  displayOutput(`Will process ${numberOfIterations} data sets.`);

  for (let i = 0; i < numberOfIterations; i++) {
    if (!moreInputAvailable()) {
      displayOutput(`Warning: Ran out of input before completing ${numberOfIterations} iterations at step ${i}.`);
      break;
    }

    const currentWords = retrieveNextStringArray();
    displayOutput(`Set ${i+1} - Words: ${currentWords.join(', ')}`);

    if (!moreInputAvailable()) break;
    const currentNumbers = extractNextNumericList();
    const sumOfNumbers = currentNumbers.reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
    displayOutput(`Set ${i+1} - Numbers: ${currentNumbers.join(', ')} (Sum: ${sumOfNumbers})`);

    if (!moreInputAvailable()) break;
    const currentChars = segmentNextToChars();
    displayOutput(`Set ${i+1} - Chars: ${currentChars.join('')}`);

    if (currentWords.includes("special")) {
      displayOutput(`  --> Detected "special" in words for set ${i+1}.`);
    }

    const combinedLength = currentWords.length + currentNumbers.length + currentChars.length;
    logDiagnosticInfo(`  Intermediate: Combined length for set ${i+1}: ${combinedLength}`);
  }

  displayOutput("--- Core Processing Finished ---");
}