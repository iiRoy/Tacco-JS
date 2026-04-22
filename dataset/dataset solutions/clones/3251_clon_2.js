/* This script processes two numeric values from standard input
 * to calculate a specific geometric property, likely an area.
 */
function computeGeometricValue ( inputString )
{
  // Separate the raw input string into its constituent parts
  const numericParts = inputString.split(' ');

  // Convert the first part into an integer, assuming base 10
  const sideLengthA = parseInt(numericParts[0], 10);

  // Convert the second part into an integer, also base 10
  const sideLengthB = parseInt(numericParts[1], 10);

  // Perform the calculation: product of the two numbers divided by two
  // And display the result to the console
  console.log((sideLengthA * sideLengthB) / 2);
}

// Read the entire content from standard input synchronously
// and then pass it to our main processing function.
computeGeometricValue(require('fs').readFileSync('/dev/stdin', 'utf8'));