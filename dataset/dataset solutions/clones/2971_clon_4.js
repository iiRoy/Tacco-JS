var dataStore = [];
var dataCursor = 0;

function fetchEntry() {
  if (dataCursor >= dataStore.length) {
    throw new Error("Input buffer exhausted.");
  }
  return dataStore[dataCursor++];
}

function retrieveNumericalPair() {
  var rawLine = fetchEntry();
  return rawLine.split(" ").map(Number);
}

function displayOutcome(content) {
  console.log(content);
}

function patternProcessor() {
  var dimensionsAndValue = retrieveNumericalPair();
  var currentDimension = dimensionsAndValue[0];
  var targetValue = dimensionsAndValue[1];

  var maximumLimit = 1 << currentDimension; // Equivalent to Math.pow(2, currentDimension)

  if (targetValue < 0 || targetValue >= maximumLimit) {
    displayOutcome("-1");
    return;
  }

  if (currentDimension === 1) {
    if (targetValue === 0) {
      displayOutcome("0 0 1 1");
    } else {
      displayOutcome("-1");
    }
    return;
  }

  if (targetValue === 0) {
    let constructedSequence = Array.from({ length: maximumLimit })
                                   .reduce((accumulator, _, index) => {
                                       accumulator.push(index, index);
                                       return accumulator;
                                   }, []);
    displayOutcome(constructedSequence.join(" "));
    return;
  }

  let initialPart = [targetValue, 0];

  let middleAscending = Array.from({ length: maximumLimit - 1 }, (_, index) => index + 1)
                             .filter(value => value !== targetValue);

  let middleDescending = Array.from({ length: maximumLimit - 1 }, (_, index) => maximumLimit - 1 - index)
                              .filter(value => value !== targetValue);

  let finalPart = [0];

  let completeResult = initialPart
                       .concat(middleAscending)
                       .concat(targetValue)
                       .concat(middleDescending)
                       .concat(finalPart);

  displayOutcome(completeResult.join(" "));
}

// To run this code, you would populate `dataStore` like this:
// dataStore = ["2 1"]; // Example: M=2, K=1
// And then call patternProcessor();
// For the purpose of the clone generation, only the function definitions and global variables are provided.
// The execution context (like `read.on('close', ...)`) is assumed to be handled externally.