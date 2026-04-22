// This JavaScript program reads a sequence of numbers from standard input,
// sorts them, and then outputs them as a space-separated string.

const rawContent = require('fs')
  .readFileSync(
    '/dev/stdin', // Specifies the standard input file path
    'utf8'        // Sets the character encoding for reading
  )
;

// Process the raw input string: split it by spaces and convert each part to an integer.
const numberSequence = rawContent
  .split(' ')
  .map(
    ( strElement ) => parseInt( strElement ) // Transforms each string part into a number
  )
;

// Sort the array of numbers in ascending order.
const orderedSequence = numberSequence.sort();

// Construct the final output string by concatenating the sorted numbers.
// The first element is used as the initial value, and subsequent elements are
// appended with a leading space.
const formattedOutput = orderedSequence
  .slice(1) // Creates a new array containing all elements except the first one
  .reduce(
    ( currentString, numericElement ) => currentString + ' ' + numericElement, // Concatenates elements with a space
    orderedSequence[0] // The starting value for the reduction process
  )
;

// Print the resulting formatted string to the console.
console.log( formattedOutput );