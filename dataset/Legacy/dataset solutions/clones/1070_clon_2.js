function segmentArray(dataElements, startPoint, endPoint) {
  // Select the pivot element from the end of the current segment
  var pivotValue = dataElements[endPoint];
  // Initialize an index for elements smaller than the pivot
  var lesserBoundary = startPoint - 1;

  // Iterate through the segment from the start to just before the pivot
  for (var iteratorIndex = startPoint; iteratorIndex < endPoint; iteratorIndex++) {
    // If the current element is less than or equal to the pivot
    if (dataElements[iteratorIndex] <= pivotValue) {
      // Increment the boundary for smaller elements
      lesserBoundary++;
      // Swap the current element with the element at the lesserBoundary
      var swapBuffer = dataElements[lesserBoundary];
      dataElements[lesserBoundary] = dataElements[iteratorIndex];
      dataElements[iteratorIndex] = swapBuffer;
    }
  }

  // After the loop, place the pivot element in its correct sorted position
  // Swap the pivot with the element just after the lesserBoundary
  var swapBuffer = dataElements[lesserBoundary + 1];
  dataElements[lesserBoundary + 1] = dataElements[endPoint];
  dataElements[endPoint] = swapBuffer;

  // Return the final index of the pivot element
  return lesserBoundary + 1;
}

// Read input from standard input
var rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into an array of lines
var processedLines = rawInputContent.split('\n');

// The first line contains the total number of items (not used in this specific logic)
var totalItems = +processedLines.shift();
// The second line contains space-separated numbers, convert them to an array of numbers
var dataElements = processedLines.shift().split(' ').map(function(strItem) {
  return +strItem;
});

// Perform the partitioning operation on the entire array
var pivotIndexResult = segmentArray(dataElements, 0, dataElements.length - 1);

// Enclose the pivot element in square brackets for output
dataElements[pivotIndexResult] = '[' + dataElements[pivotIndexResult] + ']';

// Print the modified array elements joined by spaces
console.log(dataElements.join(' '));
