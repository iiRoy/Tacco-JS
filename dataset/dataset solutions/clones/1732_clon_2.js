const fileSysModule = require( "fs" ) ;

const inputLine = fileSysModule.readFileSync( "/dev/stdin" ) ; // Read the entire input as a string from stdin

const upperBound = Number( inputLine ) ; // Convert the string input to a numerical upper limit

let cumulativeResult = 0 ; // Initialize the variable that will hold our final aggregated value

// Loop through each positive integer starting from one up to and including the upper bound
for ( let iterator = 1 ; iterator <= upperBound ; iterator++ )
{
    // Determine the integer part of the division of the upper bound by the current iterator
    const quotientFloor = Math.floor( upperBound / iterator ) ;

    // Accumulate the sum based on an arithmetic progression formula
    // The term added is iterator * (sum of integers from 1 to quotientFloor)
    cumulativeResult += ( iterator * quotientFloor * ( quotientFloor + 1 ) ) / 2 ;
}

console.log( cumulativeResult ) ; // Display the final computed sum to the standard output