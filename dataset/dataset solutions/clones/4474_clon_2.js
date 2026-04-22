'use strict';
/*
 * This module is responsible for processing a set of numerical data.
 * It reads configuration parameters, extracts relevant values, sorts them,
 * and computes a sum based on the specified count of highest values.
 */
const    handleDataProcessing    =    (    initialPayload    )    =>    {
    // Break down the incoming raw string into distinct lines
    let    lineCollection    =    initialPayload.split(    '\n'    )    ;

    // Parse the first line to get the operational parameters
    const    firstLineElements    =    lineCollection[0].split(    ' '    )    ;
    const    totalItemCount    =    Number.parseInt(    firstLineElements[0],    10    )    ; // Represents the total number of available items
    const    elementsToSumCount    =    Number.parseInt(    firstLineElements[1],    10    )    ; // Specifies how many of the largest items to sum

    // Process the second line: split, convert strings to integers, and sort in descending order
    const    descendingOrderedValues    =    lineCollection[1]
                                        .split(    ' '    )
                                        .map(    (    strVal    )    =>    Number.parseInt(    strVal,    10    )    )
                                        .sort(    (    valA,    valB    )    =>    valB    -    valA    )    ;

    // Initialize a variable to accumulate the sum
    let    calculatedSum    =    0    ;

    // Loop through the top 'elementsToSumCount' values and add them to the accumulator
    for    (    let    currentPosition    =    0    ;    currentPosition    <    elementsToSumCount    ;    currentPosition++    )    {
        calculatedSum    +=    descendingOrderedValues[currentPosition]    ;
    }

    // Display the final computed sum to the standard output
    console.log(    calculatedSum    )    ;
};

// Execute the data processing by reading content from standard input
handleDataProcessing(    require(    'fs'    )    .readFileSync(    '/dev/stdin',    'utf-8'    )    )    ;