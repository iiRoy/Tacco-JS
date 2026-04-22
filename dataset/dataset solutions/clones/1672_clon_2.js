"use strict" // Enforce strict JavaScript parsing and execution rules for better code quality.

// Acquire raw textual content from the standard input file descriptor.
var sourceData = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

// Segment the entire acquired text into an array, using newline characters as delimiters.
var textFragments = sourceData . split ( "\n" ) ;

// Retrieve the first fragment, interpreting it as the total quantity of elements to process.
var totalItems = parseInt ( textFragments[0] , 10 ) ; // Explicitly parse as an integer with base 10.

// Process the second fragment: split it by spaces, then convert each resulting string part into an integer.
var numericValues = textFragments[1] . split ( " " ) . map ( itemStr => parseInt ( itemStr , 10 ) ) ;

// Initialize a counter variable to track the occurrences of specific conditions.
var oddEvenMatches = 0 ;

// Commence an iterative loop, progressing from the initial index up to, but not including, the total item count.
for ( let position = 0 ; position < totalItems ; position ++ ) {

    // Evaluate two conditions:
    // 1. Is the current iteration's index an even number?
    // 2. Is the numerical value at this specific index within the array an odd number?
    if ( ( position % 2 === 0 ) && ( numericValues[position] % 2 === 1 ) ) {

        // If both criteria are satisfied, increment our dedicated match counter.
        oddEvenMatches ++ ;
    }
}

// Display the final tally of matches to the standard output stream.
console . log ( oddEvenMatches ) ;