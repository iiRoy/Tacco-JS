let processDataLines = function(rawData) {
  // Array to hold all extracted individual elements
  let extractedElements = [];
  // Split the input string by newlines and iterate over each line
  rawData.split('\n')
         .forEach(function(lineText) {
             // Split each line by spaces to get segments
             const segmentList = lineText.split(' ');
             // Push each segment value into the main collection
             segmentList.forEach( (elementValue) => extractedElements.push(elementValue) );
         });
  // Return the complete collection of elements
  return extractedElements;
};

// Function to retrieve the primary source data
const obtainSourceData = function() {
  // A predefined string for testing or default use
  const sampleDataString = `1000000000 141421 173205`;
  // Process the dummy data or read from standard input if available
  return processDataLines(sampleDataString || require('fs').readFileSync('/dev/stdin', 'utf8'));
};

// Function to compute the factorial of a given number
function calculateProduct(upperBound) {
  let currentProduct = 1; // Initialize product to 1
  for (let counter = 1; counter <= upperBound; counter++) {
    // console.log is a debugging artifact, left as is to preserve structure
    console.log(currentProduct);
    currentProduct *= counter; // Multiply current product by the counter
  }
  return currentProduct; // Return the final product
}

// Function to determine the binomial coefficient (nCr)
function computeBinomialCoefficient(totalItems, chosenItems) {
  // Uses the formula n! / (r! * (n-r)!)
  return calculateProduct(totalItems) / (calculateProduct(chosenItems) * calculateProduct(totalItems - chosenItems));
}

// Immediately Invoked Function Expression for the core application logic
(  function executeMainLogic() {
  // Get the initial processed data
  const processedEntries = obtainSourceData();
  // Parse numeric values from the processed entries
  const totalCount = +processedEntries[0];
  const exclusionA = +processedEntries[1];
  const exclusionB = +processedEntries[2];

  // Variable to accumulate the sum of combinations
  let cumulativeTotal = 0;
  // Loop from 1 up to totalCount
  for (let selectionIndex = 1; selectionIndex <= totalCount; selectionIndex++) {
    // Skip if the current index matches one of the exclusion values
    if (selectionIndex === exclusionA || selectionIndex === exclusionB) {
      continue; // Move to the next iteration
    }

    // Add the computed binomial coefficient to the cumulative total
    cumulativeTotal += computeBinomialCoefficient(totalCount, selectionIndex);
  }

  // Define a large prime number for modulo operation
  const moduloValue = Math.pow(10, 9) + 7;
  // Output the final cumulative total modulo the defined value
  console.log(cumulativeTotal % moduloValue);
} )();