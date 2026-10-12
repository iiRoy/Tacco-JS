var parseNum = item => parseInt(item, 10);

var parseNumArray = inputArray => inputArray.map(item => parseNum(item));

var getAbsoluteValue = item => item > 0 ? item : -item;

function findMinimum() {
  var argumentList = arguments;
  var currentValue = argumentList[0];
  for (var k = 1; k < argumentList.length; k++) {
    if (argumentList[k] < currentValue) {
      currentValue = argumentList[k];
    }
  }
  return currentValue;
}

function findMaximum() {
  var argumentList = arguments;
  var currentValue = argumentList[0];
  for (var k = 1; k < argumentList.length; k++) {
    if (argumentList[k] > currentValue) {
      currentValue = argumentList[k];
    }
  }
  return currentValue;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(rawData) {
  // Split the raw input into lines
  var inputLines = rawData.split('\n');

  // Parse the first line as the number of elements
  var countElements = parseNum(inputLines[0]);

  // Parse the second line as an array of numbers
  var numericValues = parseNumArray(inputLines[1].split(' '));

  // Initialize an array to store medians of all subarrays
  var medianCollection = [];

  // Temporary variables for subarray and its median
  var currentSlice;
  var currentMedian;

  // Iterate through all possible starting indices
  for (let outerIndex = 0; outerIndex < countElements; outerIndex++) {
    // Iterate through all possible ending indices for the current starting index
    for (let innerIndex = outerIndex; innerIndex < countElements; innerIndex++) {
      // Extract the current subarray
      currentSlice = numericValues.slice(outerIndex, innerIndex + 1);

      // Sort the subarray and find its median
      currentMedian = currentSlice.sort(function(firstElement, secondElement) {
        return firstElement - secondElement;
      })[Math.floor((innerIndex - outerIndex + 1) / 2)];

      // Add the median to the collection
      medianCollection.push(currentMedian);
    }
  }

  // Sort the collection of medians and print the median of medians
  console.log(medianCollection.sort((firstElement, secondElement) => firstElement - secondElement)[Math.floor(countElements * (countElements + 1) / 4)]);
}
