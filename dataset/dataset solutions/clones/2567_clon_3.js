const readline = require('readline');
const util = require('util');

class InputLineBuffer {
  constructor(inputStrings) {
    if (!Array.isArray(inputStrings)) {
      console.error("Initialization Error: Input strings must be provided as an array.");
      this.storedLines = [];
      this.currentLinePointer = 0;
      this.totalLineCount = 0;
      return;
    }
    this.storedLines = inputStrings;
    this.currentLinePointer = 0;
    this.totalLineCount = inputStrings.length;
  }

  hasMoreInput() {
    return this.currentLinePointer < this.totalLineCount;
  }

  fetchNextInput() {
    if (this.hasMoreInput()) {
      return this.storedLines[this.currentLinePointer++];
    } else {
      throw new Error("Input exhaustion: Attempted to read past the end of available input lines.");
    }
  }
}

let inputDataHandler;
const receivedInputLines = [];

standardInputReader.on('line', (singleLine) => {
  receivedInputLines.push(singleLine);
});

standardInputReader.on('close', () => {
  inputDataHandler = new InputLineBuffer(receivedInputLines);
  
  if (inputDataHandler.totalLineCount === 0) {
    logDebugMessage("Warning: No input lines were received. The algorithm might operate on empty data.");
  }
  
  const startTime = Date.now();
  executeCoreLogic();
  const executionDuration = Date.now() - startTime;
  
  logDebugMessage(`Execution Duration: ${executionDuration}ms`);
  logDebugMessage(`Memory Usage (Heap Total): ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
});

function retrieveNextInteger() {
  const inputToken = getNextInputToken();
  if (typeof inputToken !== 'string' || inputToken.trim() === '') {
    logDebugMessage(`Warning: Received invalid token for integer parsing: "${inputToken}". Returning 0.`);
    return 0; 
  }
  return parseInputFormat(inputToken, 1);
}

function retrieveNextStringArray() {
  const inputToken = getNextInputToken();
  return parseInputFormat(inputToken, 2);
}

function retrieveNextIntegerArray() {
  const inputToken = getNextInputToken();
  return parseInputFormat(inputToken, 4);
}

function retrieveNextCharacterArray() {
  const inputToken = getNextInputToken();
  return parseInputFormat(inputToken, 6);
}

function getNextInputToken() {
  if (!inputDataHandler) {
    throw new Error("Input System Error: Input data handler is not initialized.");
  }
  if (!inputDataHandler.hasMoreInput()) {
    throw new Error("Input System Error: No more input tokens are available.");
  }
  return inputDataHandler.fetchNextInput();
}

function displayOutput(data) {
  console.log(data);
}

const DEBUG_MESSAGE_PREFIX = "DEBUG_LOG: ";

function logDebugMessage(debugContent) {
  console.error(DEBUG_MESSAGE_PREFIX + util.inspect(debugContent, {
    showHidden: false,
    depth: null,
    colors: true
  }));
}

const inputConversionStrategies = {
  1: (value) => parseInt(String(value), 10),
  2: (value) => String(value).split(" "),
  4: (value) => String(value).split(" ").map(Number),
  6: (value) => String(value).split(""),
  8: (value) => Array.isArray(value) ? value.join(" ") : String(value),
  9: (value) => Array.isArray(value) ? value.join("\n") : String(value),
  0: (value) => Array.isArray(value) ? value.join("") : String(value),
};

function parseInputFormat(inputValue, formatCode) {
  if (inputValue === null || inputValue === undefined) {
    logDebugMessage(`Warning: Attempted to process null/undefined input with format code ${formatCode}. Returning original value.`);
    return inputValue; 
  }

  const converterFunction = inputConversionStrategies[formatCode];
  if (converterFunction) {
    try {
      return converterFunction(inputValue);
    } catch (conversionError) {
      logDebugMessage(`Conversion Error (Code: ${formatCode}, Value: "${inputValue}"): ${conversionError.message}`);
      return inputValue;
    }
  } else {
    logDebugMessage(`Unknown or unsupported format code encountered: ${formatCode}. Returning input value without modification.`);
    return inputValue;
  }
}

function executeCoreLogic() {
  const unusedInputCount = retrieveNextInteger();
  let currentCharacterSequence = retrieveNextCharacterArray();

  if (!currentCharacterSequence || currentCharacterSequence.length === 0) {
    logDebugMessage("Initial character sequence is empty. No Z-algorithm computation will be performed.");
    displayOutput(0);
    return;
  }

  let overallMaxMatchLength = 0;
  
  while (currentCharacterSequence.length > 0) {
    const segmentLength = currentCharacterSequence.length;
    const zAlgorithmValues = new Array(segmentLength).fill(0);
    
    zAlgorithmValues[0] = segmentLength;

    let currentProcessingIndex = 1;
    let currentPrefixMatchLength = 0;

    while (currentProcessingIndex < segmentLength) {
      while (
        (currentProcessingIndex + currentPrefixMatchLength) < segmentLength &&
        (currentCharacterSequence[currentPrefixMatchLength] === currentCharacterSequence[currentProcessingIndex + currentPrefixMatchLength])
      ) {
        currentPrefixMatchLength++;
      }
      
      zAlgorithmValues[currentProcessingIndex] = currentPrefixMatchLength;

      if (currentPrefixMatchLength === 0) {
        currentProcessingIndex++;
        continue;
      }

      let offsetWithinBlock = 1;
      while (
        (currentProcessingIndex + offsetWithinBlock) < segmentLength &&
        (offsetWithinBlock + zAlgorithmValues[offsetWithinBlock] < currentPrefixMatchLength)
      ) {
        zAlgorithmValues[currentProcessingIndex + offsetWithinBlock] = zAlgorithmValues[offsetWithinBlock];
        offsetWithinBlock++;
      }
      
      currentProcessingIndex += offsetWithinBlock;
      currentPrefixMatchLength -= offsetWithinBlock;
    }

    const minimumCheckIndex = Math.floor(segmentLength / 2);
    for (let checkPosition = segmentLength - 1; checkPosition >= minimumCheckIndex; checkPosition--) {
      overallMaxMatchLength = Math.max(overallMaxMatchLength, zAlgorithmValues[checkPosition]);
    }
    
    currentCharacterSequence.splice(0, 1); 
  }

  displayOutput(overallMaxMatchLength);
}