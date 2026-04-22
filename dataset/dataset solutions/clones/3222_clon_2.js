/*
 * This routine examines a collection of numerical data
 * to determine a specific property based on the largest element
 * and the sum of all elements.
 */
function analyzeDataSet(totalCount, dataElements) {
  let totalAccumulator = 0; // Initialize sum of elements
  let greatestValue = 0;    // Initialize tracking for the maximum element
  
  // Iterate through each number in the provided array
  dataElements.forEach(function(currentElement) {
    // Update the maximum value if the current element is larger
    if (greatestValue < currentElement) {
      greatestValue = currentElement;
    }
    // Add the current element to the running total
    totalAccumulator += currentElement;
  });
  
  // Check the core condition: is the greatest value less than the sum of other elements?
  if (greatestValue < totalAccumulator - greatestValue) {
    return 'TrueResult'; // Condition met, return affirmative indicator
  }
  
  return 'FalseResult'; // Condition not met, return negative indicator
}

// Main processing function for handling program input.
function ProgramEntry(rawData) {
  // Parse the incoming raw string data into individual lines.
  let linesOfText = rawData.split('\n');
  
  // The first line typically contains the count of elements.
  let elementCount = linesOfText[0];
  
  // The second line contains space-separated numbers, convert them to actual numbers.
  let numberCollection = linesOfText[1].split(' ').map(function(stringItem) {
    return Number(stringItem);
  });
  
  // Output the result from our analytical function to the console.
  console.log(analyzeDataSet(elementCount, numberCollection));
}

// Do not modify the following section. It manages standard input/output and calls the main routine.
ProgramEntry(require("fs").readFileSync("/dev/stdin", "utf8"));