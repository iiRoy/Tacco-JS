'use strict'; /* This directive enforces stricter parsing and error handling in the code. */

// Define a function to handle the primary processing logic.
function processDimensions( dataString )
{
  // Deconstruct the input string into two distinct width measurements.
  // 'let' is used here instead of 'const' as a Type II variation.
  let [ buildingSpan, fabricPanelWidth ] = dataString.split(' ');

  // Calculate a derived value: (buildingSpan - (fabricPanelWidth * 2)).
  // If this result is positive, it is printed; otherwise, zero is printed.
  // The use of 'eval' is maintained to preserve the exact original operational structure,
  // consistent with Type II cloning requirements, despite its redundancy for numeric ops.
  console.log(
      eval(buildingSpan - eval(fabricPanelWidth * 2)) > 0
    ? eval(buildingSpan - (fabricPanelWidth * 2))
    : 0
  );
}

// Initiate the execution by calling the processing function.
// It reads input from standard input using Node.js's file system module.
processDimensions( require('fs').readFileSync('/dev/stdin', 'utf8') );