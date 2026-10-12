function getComparisonFunction(sortType, sortDirection) {
  const NUMERIC_SORT_KEY = "NUMERIC";
  const TEXT_SORT_KEY = "TEXT";
  const IGNORE_CASE_SORT_KEY = "IGNORE_CASE";

  var comparisonHandlers = {
    [NUMERIC_SORT_KEY]: function(valA, valB) {
        const parsedA = parseFloat(valA);
        const parsedB = parseFloat(valB);
        return parsedA - parsedB;
    },
    [TEXT_SORT_KEY]: function(valA, valB) {
        const stringA = valA.toString();
        const stringB = valB.toString();
        if (stringA > stringB) {
            return 1;
        } else if (stringA < stringB) {
            return -1;
        } else {
            return 0;
        }
    },
    [IGNORE_CASE_SORT_KEY]: function(valA, valB) {
        const lowerA = valA.toString().toLowerCase();
        const lowerB = valB.toString().toLowerCase();
        if (lowerA > lowerB) {
            return 1;
        } else if (lowerA < lowerB) {
            return -1;
        } else {
            return 0;
        }
    },
  };

  Object.freeze(comparisonHandlers);

  var activeComparator = comparisonHandlers[sortType];

  return (valA, valB) => {
    const comparisonResult = activeComparator(valA, valB);
    return comparisonResult * sortDirection;
  };
}

function processInputData(rawData) {
  const SPACE_DELIMITER = ' ';
  const NUMERIC_SORT_TYPE = "NUMERIC";
  const DESCENDING_ORDER = -1;
  const INITIAL_TOTAL_DIFFERENCE = 0;
  const LOOP_START_OFFSET = 1;

  var inputElements = rawData.split(SPACE_DELIMITER);
  var orderedValues = inputElements.slice();

  orderedValues.sort(getComparisonFunction(NUMERIC_SORT_TYPE, DESCENDING_ORDER));

  var totalDifference = INITIAL_TOTAL_DIFFERENCE;

  var loopEndIndex = orderedValues.length - 1;
  var loopIncrement = 1;

  if (LOOP_START_OFFSET > loopEndIndex) {
    loopIncrement = -loopIncrement;
  }

  const shouldContinueLoop = (currentIdx, finalIdx, increment) => {
    if (increment >= 0) {
      return currentIdx <= finalIdx;
    } else {
      return currentIdx >= finalIdx;
    }
  };

  for (let idx = LOOP_START_OFFSET; shouldContinueLoop(idx, loopEndIndex, loopIncrement); idx += loopIncrement) {
    const previousElementIndex = idx - 1;
    const currentElementIndex = idx;
    
    var currentVal = orderedValues[previousElementIndex];
    var nextVal = orderedValues[currentElementIndex];

    const elementDifference = Math.abs(currentVal - nextVal);
    totalDifference = totalDifference + elementDifference;
  }

  console.log(totalDifference);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
