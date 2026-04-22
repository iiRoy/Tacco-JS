"use strict";

const processKnapsackData =  (inputDataString) => {
    // Split the entire input string into individual lines
    let dataLines = inputDataString . trim ( ) . split ( "\n" ) ;

    // Parse the first line to get the total number of items and the knapsack's weight capacity
    const totalItems = parseInt ( dataLines [ 0 ] . split ( " " ) [ 0 ] ) ;
    const capacityLimit = parseInt ( dataLines [ 0 ] . split ( " " ) [ 1 ] ) ;

    // Extract item weight and value pairs from the subsequent lines
    const itemDetails = dataLines . slice ( 1 , totalItems + 1 ) . map (
        ( dataLine ) => dataLine . split ( " " ) . map ( ( numericalValue ) => parseInt ( numericalValue ) )
    ) ;

    // Initialize a 2D dynamic programming table with zeros
    // The table will store the maximum value for a given number of items and capacity
    let valueTable = Array ( totalItems + 1 ) . fill ( null ) . map (
        ( ) => Array ( capacityLimit + 1 ) . fill ( 0 )
    ) ;
    let maximumObtainedValue = 0 ; // Variable to track the highest value found

    // Iterate through each item
    for ( let currentElementIndex = 1 ; currentElementIndex < totalItems + 1 ; currentElementIndex ++ ) {
        const itemWeight = itemDetails [ currentElementIndex - 1 ] [ 0 ] ; // Get the weight of the current item
        const itemValue = itemDetails [ currentElementIndex - 1 ] [ 1 ] ;   // Get the value of the current item

        // Iterate through each possible capacity from 0 up to the limit
        for ( let currentCapacity = 0 ; currentCapacity < capacityLimit + 1 ; currentCapacity ++ ) {
            // If the current item's weight exceeds the current capacity
            if ( itemWeight > currentCapacity ) {
                // We cannot include this item, so just carry over the value from the previous item set
                valueTable [ currentElementIndex ] [ currentCapacity ] = valueTable [ currentElementIndex - 1 ] [ currentCapacity ] ;
            } else {
                // We have two choices:
                // 1. Do not include the current item (value is from previous item set)
                // 2. Include the current item (value is its value + value from previous item set with remaining capacity)
                valueTable [ currentElementIndex ] [ currentCapacity ] = Math . max (
                    valueTable [ currentElementIndex - 1 ] [ currentCapacity ] ,
                    itemValue + valueTable [ currentElementIndex - 1 ] [ currentCapacity - itemWeight ]
                ) ;
            }

            // Update the overall maximum value if a new higher value is found in the table
            if ( valueTable [ currentElementIndex ] [ currentCapacity ] > maximumObtainedValue ) {
                maximumObtainedValue = valueTable [ currentElementIndex ] [ currentCapacity ] ;
            }
        }
    }

    // Output the final maximum value that can be achieved
    console . log ( maximumObtainedValue ) ;
}

// Read input from standard input and pass it to the processing function
processKnapsackData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;