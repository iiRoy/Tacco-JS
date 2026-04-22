// This program reads input from stdin, processes a string, and calculates a final count.

const inputLines = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) . trim() . split ( '\n' ) ;

// Extract the primary string and the multiplication factor from the input lines.
const inputString = inputLines[0];
const factor = parseInt ( inputLines[1] ) ;

// Group consecutive identical characters in the input string.
var charGroups = inputString . match ( / ( . ) \1* / g ) ;

// Calculate the initial number of operations needed for rewriting within each group.
var initialOperations = charGroups . reduce ( ( accumulator , element , index ) => {
  // For each group, calculate (length - length % 2) / 2
  // This effectively counts how many pairs of characters can be removed.
  return accumulator + ( element.length - element.length % 2 ) / 2 ;
} , 0 ) ;

// Initialize the final count with the base operations multiplied by the factor.
let finalCount = initialOperations * factor ;

// Get the first and last character groups to check for boundary conditions.
var firstGroup = charGroups[0] ;
var lastGroup = charGroups[ charGroups . length - 1 ] ;

// Check for a specific condition where the first and last groups' characters are the same
// and their second character's length (which is always 1 if it exists) is odd.
if ( firstGroup[0][0] === lastGroup[0][0] && firstGroup[1].length % 2 === 1 && lastGroup[1].length % 2 === 1 ) {
  // If the condition is met, adjust the total count.
  finalCount += factor - 1 ;
}

// Special handling for strings with a single character.
if ( inputString.length === 1 ) {
  finalCount = ( factor - factor % 2 ) / 2 ;
}

// Output the final calculated count.
console . log ( finalCount ) ;