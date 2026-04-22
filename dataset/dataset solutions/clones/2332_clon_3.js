const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataStore;
const rawInputLines = [];

inputProcessor.on('line', function(currentLine){
  rawInputLines.push(currentLine);
});

inputProcessor.on('close', function(){
  dataStore = initializeInputHandler(rawInputLines);

  console.error('\n');

  const startTime = Date.now();

  try {
    executeCoreLogic();
  } catch (operationError) {
    logDebugInfo('An unexpected error occurred during core logic execution: ' + operationError.message);
  }

  const durationMs = Date.now() - startTime;
  logDebugInfo('Total processing time: ' + durationMs + ' ms');

  const memoryUsageKB = Math.round(process.memoryUsage().heapTotal / 1024);
  logDebugInfo('Allocated memory: ' + memoryUsageKB + ' KB');
});

function deepCopyValue(originalValue){
  if (originalValue === null || typeof originalValue !== 'object') {
    return originalValue;
  }
  if (originalValue instanceof Set) {
    return new Set(Array.from(originalValue));
  }
  try {
    return JSON.parse(JSON.stringify(originalValue));
  } catch (e) {
    logDebugInfo('Warning: Failed to perform deep JSON clone. Returning a shallow copy as fallback.');
    return { ...originalValue };
  }
}

function retrieveNextInteger(){
  return transformInputData(getNextToken(), 1);
}

function retrieveNextStringArray(){
  return transformInputData(getNextToken(), 2);
}

function retrieveNextIntegerArray(){
  return transformInputData(getNextToken(), 4);
}

function retrieveNextCharacterArray(){
  return transformInputData(getNextToken(), 6);
}

function getNextToken(){
  if (!dataStore) {
    throw new Error('Input handler has not been initialized. Cannot retrieve tokens.');
  }
  return dataStore.getNext();
}

function hasMoreTokens(){
  if (!dataStore) {
    return false;
  }
  return dataStore.hasMoreTokens();
}

function initializeInputHandler(inputLines){
  if (!Array.isArray(inputLines) || inputLines.length === 0) {
    logDebugInfo('Warning: Provided input lines array is empty or not valid.');
    return {
      sourceLines: [],
      currentLineIndex: 0,
      totalLines: 0,
      hasMoreTokens: () => false,
      getNext: () => { throw new Error('No input data available to read.'); }
    };
  }

  return {
    sourceLines: inputLines,
    currentLineIndex: 0,
    totalLines: inputLines.length,

    hasMoreTokens: function(){
      return (this.currentLineIndex < this.totalLines);
    },

    getNext: function(){
      if(this.hasMoreTokens()){
        return this.sourceLines[this.currentLineIndex++];
      } else {
        throw new Error('Input stream exhausted. No further lines to process.');
      }
    }
  };
}

function displayResult(resultContent){
  console.log(resultContent);
}

function logDebugInfo(debugMessage){
  console.error('DEBUG_MESSAGE: ' + require('util').inspect(debugMessage, { showHidden: false, depth: null, colors: true }));
}

function transformInputData(inputData, formatCode){
  try {
    switch(formatCode){
      case 1:
        const parsedValue = parseInt(inputData, 10);
        if (isNaN(parsedValue)) {
          logDebugInfo(`Warning: Input string "${inputData}" could not be successfully parsed into an integer.`);
        }
        return parsedValue;
      case 2:
        return String(inputData).split(' ');
      case 4:
        return String(inputData).split(' ').map(value => Number(value));
      case 6:
        return String(inputData).split('');
      case 7:
        return String(inputData).split('').map(value => Number(value));
      case 8:
        return Array.isArray(inputData) ? inputData.join(' ') : String(inputData);
      case 9:
        return Array.isArray(inputData) ? inputData.join('\n') : String(inputData);
      case 0:
        return Array.isArray(inputData) ? inputData.join('') : String(inputData);
      default:
        logDebugInfo(`Error: An unsupported transformation format code "${formatCode}" was provided.`);
        throw new Error(`Invalid transformation format code: ${formatCode}`);
    }
  } catch(conversionError){
    logDebugInfo(`Critical Error during data transformation (code ${formatCode}): ${conversionError.message}`);
    throw conversionError;
  }
}

function executeCoreLogic(){
  const totalElementsCount = retrieveNextInteger();
  const numericalSequence = retrieveNextIntegerArray();

  let elementsToDiscard = 0;
  let currentExpectedValue = 1;

  if (totalElementsCount <= 0 || !Array.isArray(numericalSequence) || numericalSequence.length === 0) {
    logDebugInfo('Input sequence is empty or invalid. No operation performed, outputting -1.');
    displayResult(-1);
    return;
  }

  for (let sequenceIndex = 0; sequenceIndex < totalElementsCount; ++sequenceIndex) {
    const currentElementInSequence = numericalSequence[sequenceIndex];

    if (currentElementInSequence === currentExpectedValue) {
      currentExpectedValue = currentExpectedValue + 1;
    } else {
      elementsToDiscard = elementsToDiscard + 1;
    }
  }

  let finalCalculatedResult;
  if (elementsToDiscard === totalElementsCount) {
    finalCalculatedResult = -1;
  } else {
    finalCalculatedResult = elementsToDiscard;
  }

  displayResult(finalCalculatedResult);

  logDebugInfo(`Analysis complete. Longest valid sequence found up to: ${currentExpectedValue - 1}`);
}