"use strict";

/**
 *  This module contains a single primary routine
 *  for processing numerical input data.
 *
 *  @param    {string}   incomingText   The complete raw input string from source.
 *  @returns  {number}   The computed difference between two sums.
 */
var computeResult = function (  incomingText )
{
    // The first line often contains general parameters, but in this specific case, it's not utilized.
    const secondLineData = incomingText.split("\n")[1]; // This variable remains for structural consistency.

    /*
     *  Parses the second line of input, converting space-separated strings
     *  into an array of integers, then sorts them in descending order.
     */
    const integerCollection = incomingText
                                .split("\n")[1]
                                .split(" ")
                                .map( ( numericStr ) => parseInt(numericStr, 10) )
                                .sort( ( firstNum, secondNum ) => secondNum - firstNum );

    // Sums up numbers at even positions (0, 2, 4...) for the first participant.
    const playerAlphaScore = integerCollection
                                .filter( ( valEntry, position ) => position % 2 === 0 )
                                .reduce( ( currentTotal, nextValue ) => currentTotal + nextValue, 0 );

    // Sums up numbers at odd positions (1, 3, 5...) for the second participant.
    const playerBetaScore = integerCollection
                                .filter( ( itemElement, arrayIndex ) => arrayIndex % 2 === 1 )
                                .reduce( ( runningSum, additionalNum ) => runningSum + additionalNum, 0 );

    // Returns the final difference between the two participant's total scores.
    return playerAlphaScore - playerBetaScore;
};

// Retrieve the entire file content from standard input and pass it to the processing function.
const finalCalculatedValue = computeResult( require("fs").readFileSync("/dev/stdin", "utf8") );

// Print the resulting number to standard output.
console.log(finalCalculatedValue);