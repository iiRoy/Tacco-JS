// This script's purpose is to find integer relationships based on a given input.
const rawFileData = require("fs").readFileSync( "/dev/stdin", "utf8" );

// The entire block of text is segmented into individual string lines.
const textRows = rawFileData.split( '\n' );

// The initial line is parsed to establish our primary numerical objective.
const targetNum = parseInt( textRows[0], 10 );

// A dynamic array is initialized to contain powers, beginning with 0^5 and 1^5.
let fifthPowers = [ 0 , 1 ] ;

// The upper threshold for our power generation is calculated by squaring the target.
const limitSquare = targetNum * targetNum ;

// This loop iteratively computes and appends 5th powers to our collection.
// It continues as long as the most recently added power remains below the defined limit.
for ( let baseVal = 2 ; fifthPowers[ fifthPowers.length - 1 ] < limitSquare ; baseVal++ )
{
    fifthPowers.push( Math.pow( baseVal , 5 ) ) ; // Stores the current base value raised to the power of five.
}

// An immediately invoked function expression (IIFE) encapsulates the core search algorithm.
( ( ) => {
    // The first loop traverses through each element in our collection of fifth powers.
    for ( let idxA = 0 ; idxA < fifthPowers.length ; idxA++ ) {
        // A nested loop performs a second traversal, comparing each element with the first.
        for ( let idxB = 0 ; idxB < fifthPowers.length ; idxB++ )
        {
            // Conditional check: If the difference between two 5th powers equals the target number.
            if ( fifthPowers[ idxA ] - fifthPowers[ idxB ] === targetNum ) {
                console.log( idxA , idxB ) ; // Outputs the indices satisfying the difference condition.
                return ; // Terminates the execution once a valid pair is located.
            }
            // Alternative condition: If the sum of two 5th powers equals the target number.
            else if ( fifthPowers[ idxA ] + fifthPowers[ idxB ] === targetNum ) {
                console.log( idxA , -idxB ) ; // Outputs the indices, negating the second for a sum.
                return ; // Also terminates upon finding a sum-based solution.
            }
        }
    }
} ) ( ) ; // The anonymous function is executed here.