function processRawData(rawDataString) {
  // This array will hold all the individual numeric string values.
  const processedElements = [];

  // Split the input string by newline characters to get individual lines.
  rawDataString.split('\n').forEach(lineSegment => {
    // For each line, split it by space to get tokens.
    const tokenCollection = lineSegment.split(' ');
    // Add each token to our main collection of elements.
    tokenCollection.forEach(elementValue => processedElements.push(elementValue));
  });

  return processedElements; // Return the flattened list of string values.
}

function acquireSourceData() {
  // A sample payload for testing or when no stdin is available.
  const samplePayload = `1000000000 141421 173205`;
  // Process the sample data or read from standard input if available.
  return processRawData(samplePayload || require('fs').readFileSync('/dev/stdin', 'utf8'));
}

// Computes the factorial of a given number.
function computeProductSequence(upperBound) {
  let currentProduct = 1; // Initialize the product.
  // Loop from 1 up to the specified upper bound.
  for (let counterIndex = 1; counterIndex <= upperBound; counterIndex++) {
    // Log the current product before multiplication (as per original behavior).
    console.log(currentProduct);
    currentProduct *= counterIndex; // Multiply by the current index.
  }
  return currentProduct; // Return the final factorial value.
}

// Calculates the binomial coefficient (n choose r).
function calculateBinomialCoefficient(totalItems, selectedItems) {
  // Uses the factorial function to compute n! / (r! * (n-r)!).
  return computeProductSequence(totalItems) / (computeProductSequence(selectedItems) * computeProductSequence(totalItems - selectedItems));
}

// Main execution block wrapped in an IIFE.
(function executePrimaryLogic() {
  // Obtain the parsed input data.
  const parsedArguments = acquireSourceData();

  // Convert the first three elements to numbers.
  const totalCount = +parsedArguments[0];
  const exclusionA = +parsedArguments[1];
  const exclusionB = +parsedArguments[2];

  let accumulatedResult = 0; // Initialize a variable to accumulate the sum.

  // Iterate from 1 up to totalCount.
  for (let iterationValue = 1; iterationValue <= totalCount; iterationValue++) {
    // Skip iterations where the current value matches exclusionA or exclusionB.
    if (iterationValue === exclusionA || iterationValue === exclusionB) {
      continue; // Move to the next iteration.
    }

    // Add the binomial coefficient for the current iteration to the accumulated result.
    accumulatedResult += calculateBinomialCoefficient(totalCount, iterationValue);
  }

  // Define a large prime number for modulo operation.
  const moduloConstant = Math.pow(10, 9) + 7;
  // Output the final accumulated result modulo the constant.
  console.log(accumulatedResult % moduloConstant);
})();
