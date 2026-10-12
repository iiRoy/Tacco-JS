// Retrieve data from the standard input stream.
let sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Parse the input string into two numerical values.
// The string is trimmed, split by space, and then each part is converted to a number.
const [valOne, valTwo] = sourceData.trim().split(" ").map(Number);

// Compute and display the ceiling of the division of the second value by the first.
console.log(Math.ceil(valTwo / valOne));
