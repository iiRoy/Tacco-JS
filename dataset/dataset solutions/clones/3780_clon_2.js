"use strict";

const   inputNumberValue    =    parseInt( require('node:fs').readFileSync( '/dev/stdin', { encoding: 'utf8' } ).split('\n')[0] ) ;

let     minimumDigitSum     =    inputNumberValue                                                                                  ;

// Iterate through possible first parts, starting from 1 up to half of the input value.
for ( let firstPartition = 1 ; firstPartition < ( parseInt(inputNumberValue / 2) + 1 ) ; firstPartition++ )
{
    // Calculate the complementary second part for the current first part.
    const   secondPartition        =    inputNumberValue - firstPartition                                                            ;

    // Compute the sum of digits for both partitions.
    const   currentPartitionSum    =    computeDigitsTotal( firstPartition.toString().split('') ) + computeDigitsTotal( secondPartition.toString().split('') ) ;

    // If the combined digit sum of the current partitions is less than the previously recorded minimum, update it.
    if ( minimumDigitSum > currentPartitionSum )
    {
        minimumDigitSum = currentPartitionSum                                                                                        ;
    }
}

// Output the smallest combined digit sum found.
console.log( minimumDigitSum )                                                                                                       ;

/**
 * Calculates the sum of digits from an array of digit characters.
 * @param {string[]} digitCharacterArray An array where each element is a string representing a single digit.
 * @returns {number} The sum of all digits in the array.
 */
function computeDigitsTotal ( digitCharacterArray )
{
    let     runningTotal = 0                                                                                                         ;

    // Loop through each character in the provided array.
    digitCharacterArray.forEach( function (digitChar)
    {
        // Convert the digit character to an integer and add it to the running total.
        runningTotal += parseInt(digitChar)                                                                                          ;
    } )                                                                                                                              ;

    return runningTotal                                                                                                              ;
}