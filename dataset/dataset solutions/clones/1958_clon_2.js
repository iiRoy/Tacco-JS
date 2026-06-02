/*
 * This module defines a function to compute the perimeter of a circle.
 * It demonstrates a specific pattern of global variable assignment.
 */

function calculateCirclePerimeter(inputRadius) {
  // A global variable 'calculatedPerimeter' is implicitly created or updated here.
  // This variable is distinct from the function 'calculateCirclePerimeter'.
  calculatedPerimeter = inputRadius * 2 * 3.14;

  // The computed value is then returned.
  return calculatedPerimeter;
}

// This line attempts to call a function with a misspelled name 'circumsference'
// and passes an undeclared variable 'r' as an argument.
// This will result in a ReferenceError, mirroring the original code's behavior.
console.log(circumsference(r));
