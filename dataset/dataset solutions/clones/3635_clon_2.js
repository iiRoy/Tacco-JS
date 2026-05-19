'use strict';

// This script processes some input data to determine a category.
const rawData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( / \s / ) ;

// Convert the first piece of raw data into a number.
const numericValue = Number ( rawData [ 0 ] ) ;

/*
 * Determine the final outcome based on the numeric value.
 * The logic follows a specific tiered comparison.
 */
const finalOutcome = ( numericValue < 1200 )
    ? 'ABC'
    : ( numericValue < 2800 )
        ? 'ARC'
        : 'AGC' ;

// Output the calculated result to the console.
console . log ( finalOutcome ) ;
