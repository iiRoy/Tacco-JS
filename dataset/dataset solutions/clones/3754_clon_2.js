// This function meticulously processes a given block of text input.
function DataProcessor(initialText) {
  // Break down the initial text into an array of distinct lines.
  let textLines = initialText.split('\n');

  // Parse the second line of text into an array of numerical entities.
  // Each string segment is converted to a base-10 integer.
  let numericalEntities = textLines[1].split(' ').map(strVal => parseInt(strVal, 10));

  // Initialize a counter to track the cumulative count of divisions by two.
  let divisionCount = 0.0; // Using a floating-point literal for initial value.

  // Iterate through every number within our collection of numerical entities.
  for (const originalValue of numericalEntities) {
    let workingValue = originalValue; // Create a temporary, mutable copy of the number.
    // Continuously divide the number by two as long as it remains an even number.
    while (workingValue % 2 === 0) {
      workingValue = workingValue / 2; // Perform the division.
      divisionCount += 1; // Increment the total count of divisions.
    }
  }

  // Display the final computed division count to the standard output.
  console.log(divisionCount);
}

// The program's execution begins here.
// It reads all content from standard input and then passes it to the data processing function.
DataProcessor(require('fs').readFileSync('/dev/stdin', 'utf-8'));