'use strict' ;

  // Retrieve raw input data from standard input stream
const rawData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;

   // Parse the total number of items available
const itemCount = +rawData [ 0 ] . split ( ' ' ) [ 0 ] ;
   // Parse the desired quantity for ingredient A
const targetA = +rawData [ 0 ] . split ( ' ' ) [ 1 ] ;
    // Parse the desired quantity for ingredient B
const targetB = +rawData [ 0 ] . split ( ' ' ) [ 2 ] ;

    // Process subsequent lines into an array of item specifications (A, B, Price)
const itemData = rawData . slice ( 1 ) . map ( line => line . split ( ' ' ) . map ( Number ) ) ;


let minCosts = [ ] ; // Initialize a 3D array to store minimum costs for (itemIndex, sumA, sumB)
const maxItemA = 10 ; // Maximum 'A' units an individual item can provide
const maxItemB = 10 ; // Maximum 'B' units an individual item can provide
const maxItemPrice = 100 ; // Maximum cost of an individual item

// Initialize the dynamic programming table with a sufficiently large value
// This value represents an unreachable state or infinite cost.
for ( let itemIndex = 0 ; itemIndex < itemCount ; itemIndex ++ ) {

    minCosts [ itemIndex ] = [ ] ;

    for ( let sumA = 1 ; sumA <= maxItemA * itemCount ; sumA ++ ) {

        minCosts [ itemIndex ] [ sumA - 1 ] = [ ] ;

        for ( let sumB = 1 ; sumB <= maxItemB * itemCount ; sumB ++ ) {

            minCosts [ itemIndex ] [ sumA - 1 ] [ sumB - 1 ] = maxItemPrice * itemCount + 1 ;
        }
    }
}


// Fill the dynamic programming table using a bottom-up approach
for ( let currentItemIdx = 0 ; currentItemIdx < itemCount ; currentItemIdx ++ ) {
    // Extract properties (A, B, Price) of the current item being considered
    let currentA = itemData [ currentItemIdx ] [ 0 ] ;
    let currentB = itemData [ currentItemIdx ] [ 1 ] ;
    let currentPrice = itemData [ currentItemIdx ] [ 2 ] ;

    // Special handling for the first item in the list
    if ( currentItemIdx === 0 ) {
        // If it's the first item, the cost to achieve its A and B values is simply its price
        minCosts [ currentItemIdx ] [ currentA - 1 ] [ currentB - 1 ] = currentPrice ;
        continue ; // Move to the next item
    }

    // Iterate through all possible accumulated 'A' values up to the maximum possible
    for ( let accumulatedA = 1 ; accumulatedA <= maxItemA * itemCount ; accumulatedA ++ ) {
        // If the current accumulated 'A' value is too small to incorporate 'currentA' from the item,
        // then the cost is simply carried over from the previous item's state.
        if ( accumulatedA <= currentA ) {
            for ( let accumulatedB = 1 ; accumulatedB < maxItemB * itemCount ; accumulatedB ++ ) {
                minCosts [ currentItemIdx ] [ accumulatedA - 1 ] [ accumulatedB - 1 ] = minCosts [ currentItemIdx - 1 ] [ accumulatedA - 1 ] [ accumulatedB - 1 ] ;
            }
            continue ; // Skip to the next accumulatedA value
        }

        // Iterate through all possible accumulated 'B' values up to the maximum possible
        for ( let accumulatedB = 1 ; accumulatedB <= maxItemB * itemCount ; accumulatedB ++ ) {
            // If the current accumulated 'B' value is too small to incorporate 'currentB' from the item,
            // then the cost is simply carried over from the previous item's state.
            if ( accumulatedB <= currentB ) {
                minCosts [ currentItemIdx ] [ accumulatedA - 1 ] [ accumulatedB - 1 ] = minCosts [ currentItemIdx - 1 ] [ accumulatedA - 1 ] [ accumulatedB - 1 ] ;
                continue ; // Skip to the next accumulatedB value
            }

            // Calculate the minimum cost for the current (accumulatedA, accumulatedB) state.
            // This involves two options:
            // 1. Not including the current item (cost comes from previous item's state).
            // 2. Including the current item (cost comes from previous item's state with reduced A and B values, plus current item's price).
            minCosts [ currentItemIdx ] [ accumulatedA - 1 ] [ accumulatedB - 1 ] = Math . min (
                minCosts [ currentItemIdx - 1 ] [ accumulatedA - 1 ] [ accumulatedB - 1 ] , // Cost without using the current item
                minCosts [ currentItemIdx - 1 ] [ accumulatedA - currentA - 1 ] [ accumulatedB - currentB - 1 ] + currentPrice // Cost when using the current item
            ) ;
        }
    }
}


let finalResult = maxItemPrice * itemCount + 1 ; // Initialize the final minimum cost with the large "unreachable" value

let aMultiple = targetA ; // Starting point for checking 'A' multiples
let bMultiple = targetB ; // Starting point for checking 'B' multiples

// Iterate through all possible multiples of targetA and targetB within the valid ranges
// to find the overall minimum cost that satisfies the ratio.
while ( aMultiple <= maxItemA * itemCount && bMultiple <= maxItemB * itemCount ) {
    finalResult = Math . min ( finalResult , minCosts [ itemCount - 1 ] [ aMultiple - 1 ] [ bMultiple - 1 ] ) ;
    aMultiple += targetA ; // Increment 'A' to the next multiple
    bMultiple += targetB ; // Increment 'B' to the next multiple
}

// Output the final minimum cost. If it's still the initial large value,
// it means no combination could achieve the desired ratio, so output -1.
console . log ( finalResult === maxItemPrice * itemCount + 1 ? -1 : finalResult ) ;