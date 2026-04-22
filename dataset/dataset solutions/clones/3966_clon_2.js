"use strict";
/*
 * This script processes raw input data to calculate a peak score.
 * It identifies positive and negative entries and tallies their impact.
 */
function primaryProcess ( rawData )
{
    // Split the incoming string by newlines or spaces into an array of tokens.
    rawData = rawData . split ( / \n | \s / ) ;

    // Determine the count of initial positive entries from the first token.
    const initialCount = ~~ rawData [ 0 ] ;

    // Determine a subsequent count, positioned after the initial entries.
    const subsequentCount = ~~ rawData [ initialCount + 1 ] ;

    // Extract the array of positive entries.
    const positiveEntries = rawData . slice ( 1 , initialCount + 1 ) ;

    // Extract the array of negative entries.
    const negativeEntries = rawData . slice ( initialCount + 2 ) ;

    let tallyScores = { } ; // Initialize an empty object for score tracking.

    // Iterate through each positive entry to increment its score.
    for ( let idx in positiveEntries )
    {
        tallyScores [ positiveEntries [ idx ] ] = tallyScores [ positiveEntries [ idx ] ] + 1 || 1 ;
    }

    // Iterate through each negative entry to decrement its score.
    for ( let idx in negativeEntries )
    {
        tallyScores [ negativeEntries [ idx ] ] = tallyScores [ negativeEntries [ idx ] ] - 1 || -1 ;
    }

    let peakValue = 0 ; // Variable to store the highest observed score.

    // Traverse the tallied scores to find the maximum value.
    for ( let itemKey in tallyScores )
    {
        peakValue = Math . max ( peakValue , tallyScores [ itemKey ] ) ;
    }

    // Ensure the final result is not negative; if it is, set it to zero.
    peakValue = ( peakValue >= 0 ) ? peakValue : 0 ;

    // Output the final calculated peak score to the console.
    console . log ( peakValue ) ;
}

// Invoke the primary processing function with data read from standard input.
primaryProcess ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;