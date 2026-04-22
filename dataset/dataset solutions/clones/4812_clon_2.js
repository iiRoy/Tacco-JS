process.stdin.resume();
process.stdin.setEncoding('ascii');

var incomingTextBuffer = "";
var processedLines = [];
var currentLinePointer = 0;

process.stdin.on(
  'data',
  function (incomingDataChunk) {
    incomingTextBuffer += incomingDataChunk;
  }
);

process.on(
  'SIGINT',
  function () {
    processedLines = incomingTextBuffer.split('\n');
    performCoreLogic();
    process.exit();
  }
);

process.stdin.on(
  'end',
  function () {
    processedLines = incomingTextBuffer.split('\n');
    performCoreLogic();
  }
);

function retrieveNextLine() {
  return processedLines[currentLinePointer++];
}

/* Core application logic begins below this section. */

function performCoreLogic() {
  var totalElements = parseInt(retrieveNextLine());
  var sourceValuesArray = [], frequencyCounts = [];
  var lineTokens = retrieveNextLine().split(" ");

  for (var elementIndex = 0; elementIndex < totalElements; elementIndex++) {
    sourceValuesArray.push(parseInt(lineTokens[elementIndex]));
    frequencyCounts.push(2);
  }

  frequencyCounts[0] = 1;

  for (var elementIndex = 0; elementIndex < totalElements; elementIndex++) {
    frequencyCounts[sourceValuesArray[elementIndex]]--;
  }

  // Validate array conditions
  var startingPosition;
  if (totalElements % 2 === 1) {
    startingPosition = 0;
  } else {
    startingPosition = 1;
  }

  for (var arrayIterator = startingPosition; arrayIterator < totalElements; arrayIterator += 2) {
    if (frequencyCounts[arrayIterator] !== 0) {
      console.log("0");
      return;
    }
  }

  // Compute the final numerical result
  var finalNumericalResult = 1;
  for (var multiplierIndex = 1; multiplierIndex < totalElements; multiplierIndex += 2) {
    finalNumericalResult *= 2;
  }
  console.log(finalNumericalResult.toString());
}