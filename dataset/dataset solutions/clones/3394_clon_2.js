"use strict";

function checkIfBinaryPower ( inputNumber )
{
    // This function determines if a given integer is a power of two.
    // A positive integer 'N' is a power of two if its binary representation
    // consists of a single '1' followed by zero or more '0's.

    let binaryStringForm = inputNumber . toString( 2 ) ;


    // First, check the most significant bit.
    // If it's not '1', then it cannot be a power of two.
    if ( binaryStringForm[0] !== "1" )
    {
        return false;
    }


    // Next, examine the remaining bits.
    // All subsequent bits must be '0' for the number to be a true power of two.
    for ( let charIndex = 1; charIndex < binaryStringForm . length; charIndex++ )
    {
        if ( binaryStringForm[ charIndex ] !== "0" )
        {
            return false; // Found a '1' in an unexpected position.
        }
    }

    // If all conditions are met, the number is indeed a power of two.
    return true;
}


function processAndCalculate ( rawInputData )
{
    // The main processing routine to find pairs that sum to a power of two.

    // Parse the incoming string data.
    // Split it into individual lines and discard any empty strings that might result.
    const processedLines = rawInputData
        . split( "\n" )
        . filter( currentLine => currentLine !== "" ) ;


    // Extract the numerical data from the second line of the input.
    // This line is expected to contain space-separated numbers.
    const numericValues = processedLines[1]
        . split( " " )
        . map( Number ) ;


    // Sort the collection of numbers in a descending order.
    // This strategy helps in efficiently finding pairs.
    let descendingNumbers = numericValues
        . sort( ( firstVal, secondVal ) => secondVal - firstVal ) ;


    // Initialize a counter to keep track of how many valid pairs are discovered.
    let pairMatchesCount = 0 ;


    // Continue iterating as long as there are numbers available to form pairs.
    while ( descendingNumbers . length > 0 )
    {
        // A flag to indicate if a matching pair was successfully identified
        // for the current leading number in the list.
        let foundValidPair = false ;


        // Iterate through the remaining elements starting from the second one.
        // The goal is to find an element that, when summed with the first element,
        // results in a power of two.
        for ( let currentElementIndex = 1; currentElementIndex < descendingNumbers . length; currentElementIndex++ )
        {
            // Compute the sum of the very first number and the number at the current index.
            let combinedResult = descendingNumbers[0] + descendingNumbers[ currentElementIndex ] ;


            // Utilize the helper function to verify if this sum is a power of two.
            if ( checkIfBinaryPower( combinedResult ) )
            {
                // If the sum is a power of two, a valid pair has been identified.

                // Remove the second number from the pair (at currentElementIndex).
                descendingNumbers . splice( currentElementIndex, 1 ) ;
                // Then, remove the first number from the pair (which is always at index 0).
                descendingNumbers . splice( 0, 1 ) ;

                // Increment the total count of found pairs.
                pairMatchesCount += 1 ;

                // Set the flag to true, indicating success for this iteration.
                foundValidPair = true ;

                // Break out of the inner loop as the leading number has found its pair.
                break ;
            }
        }


        // If, after checking all possibilities, no pair was found for the leading number,
        // it means this number cannot form a power-of-two sum with any other remaining number.
        // Therefore, remove it from the list.
        if ( !foundValidPair )
        {
            descendingNumbers . splice( 0, 1 ) ;
        }
    }

    // Print the final tally of all successful pairs found.
    console . log( pairMatchesCount ) ;
}


// Entry point for the script execution.
// Reads input from standard input and passes it to the primary processing function.
processAndCalculate ( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) ) ;