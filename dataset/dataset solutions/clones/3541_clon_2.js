'use strict';

// This core function is responsible for analyzing and calculating the final financial outcome
const processInput = (rawData) => {
  // Decompose the entire input string into an array of individual lines
  const linesOfData = rawData.split('\n');

  // Extract and parse the first line to get the initial configuration values
  const setupParameters = linesOfData[0].split(' ');

  // Convert the first configuration parameter to an integer, representing the count of elements
  const elementCount = parseInt(setupParameters[0], 10);

  // Convert the second configuration parameter to an integer, representing a fundamental monetary unit
  const monetaryUnit = parseInt(setupParameters[1], 10);

  // Parse the second line, extracting and limiting the item-specific values based on the element count
  const itemSpecificValues = linesOfData[1].split(' ').slice(0, elementCount);

  // Initialize a variable to accumulate the total calculated expenditure
  let totalExpenditure = 0;

  // Set up an index for iterating backward through the item-specific values
  let currentElementIndex = elementCount - 1;

  // Begin the primary loop, processing items from the last to the first
  while (currentElementIndex >= 0) {
    // Add the initial base charge for the current item and the monetary unit
    totalExpenditure += 5 * itemSpecificValues[currentElementIndex] + 2 * monetaryUnit;

    // Initialize a secondary counter for evaluating preceding items
    let comparisonStep = 1;

    // Start a nested loop to explore combinations with items positioned earlier in the sequence
    while (currentElementIndex - comparisonStep >= 0) {
      // Retrieve the value of a prior item for comparison
      const previousElementValue = itemSpecificValues[currentElementIndex - comparisonStep];

      // Calculate the standard independent charge for this prior item
      const standardCharge = 5 * previousElementValue + 2 * monetaryUnit;

      // Calculate an alternative, potentially optimized charge for grouping with this previous item
      // This formula simplifies from a quadratic form to (2 * comparisonStep + 3) * previousElementValue + monetaryUnit
      const optimizedCharge = (2 * comparisonStep + 3) * previousElementValue + monetaryUnit;

      // Decide whether the standard charge is more economical than the optimized group charge
      if (standardCharge < optimizedCharge) {
        // If the standard charge is lower, cease further grouping attempts for the current segment
        break;
      } else {
        // If the optimized charge is better or equal, incorporate it into the total
        totalExpenditure += optimizedCharge;
        // Advance the comparison step to consider the next preceding item
        comparisonStep++;
      }
    }
    // Adjust the main index by the total number of items included in the current processing block
    currentElementIndex -= comparisonStep;
  }
  // Output the final computed total expenditure to the console
  console.log(totalExpenditure);
};

// A boolean flag to control the execution mode, enabling or disabling test cases
const activateTestMode = false;

// Conditional block: Execute either predefined test scenarios or process live input
if (activateTestMode) {
  // Test case 1: Smallest input example
  processInput('2 100\n1 10');
  // Test case 2: Larger numbers with a small monetary unit
  processInput('5 1\n1 999999997 999999998 999999999 1000000000');
  // Test case 3: A more complex set of data
  processInput('10 8851025\n38 87 668 3175 22601 65499 90236 790604 4290609 4894746');
  // Test case 4: Extensive data with varying magnitudes
  processInput('16 10\n1 7 12 27 52 75 731 13856 395504 534840 1276551 2356789 9384806 19108104 82684732 535447408');
} else {
  // In live mode, read the entire content from standard input and pass it to the processing function
  processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
}