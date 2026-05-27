function parseInteger(inputString) { return parseInt(inputString, 10); }
function parseFloatValue(inputString) { return parseFloat(inputString); }

Array.prototype.sortNumericAscending = function () { return this.sort((a, b) => (a - b)); }
Array.prototype.sortNumericDescending = function () { return this.sort((a, b) => (b - a)); }
Array.prototype.sortStringAscending = function () { return this.sort();                  }
Array.prototype.sortStringDescending = function () { return this.sort().reverse();        }
Array.prototype.filterOut = function (itemToRemove) { return this.filter((element) => element !== itemToRemove); }

let rawDataBuffer = '';

class SearchCompletionSignal extends Error {
    constructor(message = "Search completed successfully, exiting.") {
        super(message);
        this.name = "SearchCompletionSignal";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SearchCompletionSignal);
        }
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', dataSegment => rawDataBuffer += dataSegment);
process.stdin.on('end', () => {
  let processedLines = rawDataBuffer.split('\n').map(lineContent => lineContent.trim());

  const lastLineIndex = processedLines.length - 1;
  if (lastLineIndex >= 0 && processedLines[lastLineIndex] === '') {
    processedLines = processedLines.slice(0, lastLineIndex);
  }

  executeMainLogic(processedLines);
});

const parseLineOfIntegers = (line) => line.split(' ').map(parseInteger);

let maxValueFound = 0;

function executeMainLogic(inputLines) {
  const initialParameters = parseLineOfIntegers(inputLines[0]);
  const itemCount = initialParameters[0];
  const maxWeightCapacity = initialParameters[1];

  const itemData = inputLines.slice(1).map(parseLineOfIntegers);

  const START_ITEM_INDEX = 0;
  const INITIAL_ACCUMULATED_WEIGHT = 0;
  const INITIAL_ACCUMULATED_VALUE = 0;

  function exploreCombinations(currentItemIndex, currentAccumulatedWeight, currentAccumulatedValue) {
    if (currentItemIndex === itemCount) {
      throw new SearchCompletionSignal();
    }

    for (let loopIndex = currentItemIndex; loopIndex < itemCount; loopIndex++) {
      const currentItemDetails = itemData[loopIndex];
      const itemWeight = currentItemDetails[0];
      const itemValue = currentItemDetails[1];

      const potentialNewWeight = itemWeight + currentAccumulatedWeight;
      if (potentialNewWeight <= maxWeightCapacity) {
        if (itemValue + currentAccumulatedValue > maxValueFound) {
            maxValueFound = itemValue + currentAccumulatedValue;
        }

        exploreCombinations(loopIndex + 1, potentialNewWeight, itemValue + currentAccumulatedValue);
      }
    }
  }

  try {
    exploreCombinations(START_ITEM_INDEX, INITIAL_ACCUMULATED_WEIGHT, INITIAL_ACCUMULATED_VALUE);
  } catch (signal) {
    if (signal instanceof SearchCompletionSignal) {
      console.log(maxValueFound);
      process.exit(0);
    } else {
      throw signal;
    }
  }

  console.log(maxValueFound);
}
