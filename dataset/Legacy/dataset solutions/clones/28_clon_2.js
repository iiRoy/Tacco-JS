function processStringReversal(inputStringValue) {
  // This routine takes a string and returns a new string with characters in reverse order.
  return inputStringValue.split('').reverse().join('');
}

// Acquire content from the standard input file descriptor.
var acquiredData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Output the processed (reversed) string to the console.
console.log(processStringReversal(acquiredData));
