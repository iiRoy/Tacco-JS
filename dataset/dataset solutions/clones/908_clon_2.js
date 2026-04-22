let totalCount;
let stringInputs = [];
let processedData = [];

function analyzeParentheses(inputStr) {
  let balanceCounters = [0, 0];
  // Iterate through the characters of the input string
  iterateRange(inputStr.length, function(idx) {
    if (inputStr.charAt(idx) === '(') {
      ++balanceCounters[1]; // Increment count for opening brackets
    } else {
      if (balanceCounters[1] > 0) {
        --balanceCounters[1]; // Match an opening bracket
      } else {
        ++balanceCounters[0]; // Count as an unmatched closing bracket
      }
    }
  });
  return balanceCounters;
}

function executeProgram() {
  totalCount = retrieveNumber();
  // Read all input strings
  iterateRange(totalCount, function(k) {
    stringInputs[k] = retrieveString();
  });

  // Process each string to get parenthesis balance
  iterateRange(totalCount, function(k) {
    processedData[k] = analyzeParentheses(stringInputs[k]);
  });

  // Sort the processed data based on specific criteria
  processedData.sort(function(itemA, itemB) {
    const diffA = itemA[1] - itemA[0]; // Open - Close balance for item A
    const diffB = itemB[1] - itemB[0]; // Open - Close balance for item B
    if (diffA < 0 && diffB < 0) {
      return itemB[0] - itemA[0]; // If both are negative, prioritize fewer unmatched closing
    }
    return diffB - diffA; // Otherwise, prioritize higher (open - close) difference
  });

  let currentBalance = 0;
  let isFeasible = true;

  // Attempt to combine parenthesis sequences
  iterateRange(totalCount, function() {
    let didUpdate = false;
    iterateRange(totalCount, function(j) {
      if (processedData[j] !== null && currentBalance >= processedData[j][0]) {
        currentBalance += (processedData[j][1] - processedData[j][0]);
        processedData[j] = null; // Mark as used
        didUpdate = true;
        return false; // Break from inner loop
      }
    });
    if (!didUpdate) {
      isFeasible = false;
      return false; // Break from outer loop
    }
  });
  outputResult(isFeasible && currentBalance === 0 ? 'Yes' : 'No');
}

function iterateRange(startVal, endVal, callbackFn) {
  if (callbackFn === undefined) {
    callbackFn = endVal;
    endVal = startVal;
    startVal = 0;
  }
  for (let loopIndex = startVal; loopIndex < endVal; ++loopIndex) {
    if (callbackFn(loopIndex) === false) {
      break;
    }
  }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

let dataBuffer = '';
let bufferPosition = 0;

function retrieveNumber() {
  return +dataBuffer[bufferPosition++];
}

function retrieveString() {
  return dataBuffer[bufferPosition++];
}

function outputResult(valueToLog) {
  console.log(valueToLog);
}

process.stdin.on('data', function(inputChunk) {
  dataBuffer += inputChunk;
});

process.stdin.on('end', function() {
  dataBuffer = dataBuffer.trim().split(/\s+/);
  executeProgram();
});