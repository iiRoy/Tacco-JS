/*
 * This module processes a multi-line string input
 * to perform specific numerical calculations.
 */
function ProcessDataStream(incomingText) {
    // Extract numerical sequences from the raw input string.
    // The first line is ignored, and subsequent lines are parsed into arrays of integers.
    const firstNumericSet = incomingText
        .split('\n')[1]
        .split(' ')
        .map(function(textValue) {
            return parseInt(textValue, 10); // Explicitly specify radix for safety
        });

    const secondNumericSet = incomingText
        .split('\n')[2]
        .split(' ')
        .map(  function  (  textValue  ) {
            return  parseInt(  textValue  ,  10  );
        }  );

    const thirdNumericSet = incomingText
        .split('\n')[3]
        .split(' ')
        .map(
            function (textValue) {
                return parseInt(textValue, 10);
            }
        );

    // Calculate the count of elements from the first set that are smaller
    // than each corresponding element in the second set.
    const lessThanCounts = secondNumericSet.map(
        function(currentBValue) {
            return firstNumericSet.filter(
                function(currentAValue) {
                    return currentAValue < currentBValue;
                }
            ).length;
        }
    );

    console.log(lessThanCounts); // Display an intermediate computed array.

    // Perform a complex summation based on the three sets of numbers.
    // This involves nested mapping and reduction operations.
    const finalAccumulation = thirdNumericSet.map(
        function(currentCValue) {
            return secondNumericSet.map(
                function(innerBValue, innerBIndex) {
                    return innerBValue < currentCValue ? lessThanCounts[innerBIndex] : 0;
                }
            ).reduce(
                function(partialSum, itemToAdd) {
                    return partialSum + itemToAdd;
                }
            );
        }
    ).reduce(
        function(overallSum, currentSubtotal) {
            return overallSum + currentSubtotal;
        }
    );

    console.log(finalAccumulation); // Output the final calculated total.
}

// Boilerplate code for handling standard input/output.
// Do not modify the section below this comment, as it manages system interaction.
ProcessDataStream( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) );