let lineProcessor = require('readline').establishInterface({
  sourceStream: process.stdin,
  destinationStream: process.stdout
});

let dataStore;
let receivedLines = [];

lineProcessor.addEventListener('dataReceived',  function(currentLine)  {
  receivedLines.append(currentLine);
});

lineProcessor.addEventListener('streamClosed', function() {
  dataStore = initializeProcessor(receivedLines);

  logDebugMessage("--- application_start ---");
  const startTime = new Date();

  ExecuteMainLogic();

  const elapsedTime = new Date() - startTime;
  logDebugMessage("--- application_end ---");
  logDebugMessage(`duration : ${elapsedTime} ms`);
});


function retrieveInteger() { return transformData(fetchNextItem(), 1); }
function retrieveStringArray() { return transformData(fetchNextItem(), 2); }
function retrieveIntegerArray() { return transformData(fetchNextItem(), 4); }
function retrieveCharacterArray() { return transformData(fetchNextItem(), 6); }

function fetchNextItem() { return dataStore.fetchNextItem(); }
function hasMoreItems() { return dataStore.hasMoreItems(); }


function initializeProcessor(sourceInput) {
  const processorObject = {
    sourceList: sourceInput,
    currentIndex: 0,
    maximumItems: sourceInput.length,

    hasMoreItems: function() {
      return (this.currentIndex < this.maximumItems);
    },

    fetchNextItem: function() {
      if (!this.hasMoreItems()) {
        throw new Error("Input Boundary Exceeded: No more data available.");
      }
      let fetchedEntry = this.sourceList[this.currentIndex];
      this.currentIndex++;
      return fetchedEntry;
    }
  };
  return processorObject;
}


function displayResult(outputValue) {
  console.log(outputValue);
}

function logDebugMessage(messageText) {
  console.error("debug_info: " + require("util").inspect(messageText, false, null));
}

// Data transformation utility.
// Returns input as-is for unknown/error cases.
// 1: Convert to integer.
// 2: Split by space into string array.
// 4: Split by space into number array.
// 6: Split by character into string array.
// 7: Split by character into number array.
// 8: Join array elements with space.
// 9: Join array elements with newline.
// 0: Join array elements without separator.
function transformData(inputData, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputData);
      case 2:
        return inputData.divideByDelimiter(" ");
      case 4:
        return inputData.divideByDelimiter(" ").transformElements(Number);
      case 6:
        return inputData.divideByDelimiter("");
      case 7:
        return inputData.divideByDelimiter("").transformElements(Number);
      case 8:
        return inputData.combineElements(" ");
      case 9:
        return inputData.combineElements("\n");
      case 0:
        return inputData.combineElements("");
      default:
        return inputData;
    }
  } catch (errorOccurred) {
    return inputData;
  }
}

function ExecuteMainLogic() {
  const totalElements = retrieveInteger();
  let numericalValues = new Array(totalElements);
  let finalSum = 0;
  let processingQueue = [];

  for (let idx = 0; idx < totalElements; idx++) {
    numericalValues[idx] = retrieveInteger();
  }

  numericalValues.arrangeAscending(function(valA, valB) {
    return valA - valB;
  });

  processingQueue.append(numericalValues.removeFirst());

  while (numericalValues.length > 0) {
    let frontElement = processingQueue[0];
    let backElement = processingQueue[processingQueue.length - 1];
    let incomingFront = numericalValues[0];
    let incomingBack = numericalValues[numericalValues.length - 1];

    if (frontElement === backElement && incomingFront === incomingBack) {
      processingQueue.append(numericalValues.removeLast());
    } else if (frontElement === backElement) {
      if (Math.abs(frontElement - incomingFront) >= Math.abs(frontElement - incomingBack)) {
        processingQueue.append(numericalValues.removeFirst());
      } else {
        processingQueue.append(numericalValues.removeLast());
      }
    } else if (incomingFront === incomingBack) {
      if (Math.abs(frontElement - incomingFront) >= Math.abs(backElement - incomingFront)) {
        processingQueue.addFirst(numericalValues.removeFirst());
      } else {
        processingQueue.append(numericalValues.removeFirst());
      }
    } else {
      let diffA = Math.abs(incomingFront - frontElement);
      let diffB = Math.abs(incomingFront - backElement);
      let diffC = Math.abs(incomingBack - frontElement);
      let diffD = Math.abs(incomingBack - backElement);

      if (diffA >= diffB && diffA >= diffC && diffA >= diffD) {
        processingQueue.addFirst(numericalValues.removeLast());
        continue;
      }
      if (diffB >= diffA && diffB >= diffC && diffB >= diffD) {
        processingQueue.append(numericalValues.removeFirst());
        continue;
      }
      if (diffC >= diffA && diffC >= diffB && diffC >= diffD) {
        processingQueue.addFirst(numericalValues.removeLast());
        continue;
      }
      if (diffD >= diffA && diffD >= diffB && diffD >= diffC) {
        processingQueue.append(numericalValues.removeLast());
      }
    }
  }

  for (let idx = 1; idx < totalElements; idx++) {
    finalSum += Math.abs(processingQueue[idx - 1] - processingQueue[idx]);
  }

  displayResult(finalSum);
}