// Function responsible for processing incoming textual data
function processInputData(rawData) {
  // Divide the entire input string into an array of distinct lines
  const lineSegments = rawData.split('\n');

  // Parse the second line, splitting it by spaces and converting each part to a floating-point number
  const numericSequence = lineSegments[1].split(' ').map(parseFloat);

  // Initialize a tally to count elements that are divisible by another element in the sequence
  let divisibleCount = 0;

  // Begin an outer iteration over each number in the collection
  for (let outerIndex = 0; outerIndex < numericSequence.length; outerIndex++) {
    // Capture the current number from the sequence for evaluation
    let currentElement = numericSequence[outerIndex];

    // Start an inner iteration to compare the current element with every other number
    for (let innerIndex = 0; innerIndex < numericSequence.length; innerIndex++) {
      // Check if the two indices are different AND if the current element is perfectly divisible by the inner element
      if (outerIndex !== innerIndex && currentElement % numericSequence[innerIndex] === 0) {
        // If a divisor is found, increment the counter and terminate the inner loop
        divisibleCount++;
        break; // No need to check further divisors for this specific 'currentElement'
      }
    }
  }

  // Output the final computed result: total elements minus those found to be divisible by another
  console.log(numericSequence.length - divisibleCount);
}

// Execute the main processing routine by reading content from standard input
processInputData(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);