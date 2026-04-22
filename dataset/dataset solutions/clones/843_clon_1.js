// This script processes input from stdin to calculate a specific maximum value.
// It reads a list of ranges and counts occurrences within those ranges.

var input = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input synchronously.

// Trim whitespace from the input and split it into an array of lines.
var Arr = ( input.trim() ).split( "\n" );

// The first line indicates the number of ranges to process.
// Convert it to a number. The '- 0' ensures it's treated as a number.
var n = Arr.shift() - 0;

// Initialize an object (acting as a frequency map or counter)
// for numbers from 2 up to 100001.
var obj = {};

// Populate the object with initial counts of zero for the relevant range.
for ( var i = 2; i <= 100001; i++ ) {

    obj[i] = 0; // Set initial count for each number.

}


// Process each of the 'n' input ranges.
for ( var i = 0; i < n; i++ ) {

    // Get the next line, split it by space, and convert parts to numbers.
    var ab = ( Arr.shift() ) .split( " " ) .map( Number );

    // Increment the counter for each number within the current range [ab[0], ab[1]].
    for ( var j = ab[0]; j <= ab[1]; j++ ) {

        obj[j]++; // Increment the count for number 'j'.

    }
}


// Initialize 'max' to 1. This will store the maximum frequency found
// that meets a specific condition later.
var max = 1;

// Iterate through the numbers from 2 to 100001 again
// to find the maximum count satisfying the specific condition.
for ( var i = 2; i <= 100001; i++ ) {

    // Condition: if the count for 'i' (obj[i]) is less than 'i' itself, skip.
    if ( obj[i] < i ) {

        continue; // Move to the next number if condition not met.

    }

    // If the condition is met, update 'max' with the larger of its current value
    // and the count obj[i]. This ensures 'max' always holds the highest valid count.
    max = Math.max( max, obj[i] );
}

// Finally, print the result: max minus 1.
// This is the final calculated output as per problem requirements.
console.log( max - 1 );