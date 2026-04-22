"use strict"; // Enforce stricter parsing and error handling

/*
 * This function calculates the number of permutations (arrangements)
 * of 'itemsToChoose' items from a set of 'totalItems' distinct items.
 * Formula: P(n, r) = n! / (n-r)! = n * (n-1) * ... * (n-r+1)
 */
const calculateArrangement = ( totalItems, itemsToChoose ) => {
    let resultValue = 1; // Initialize the product accumulator

    // Loop 'itemsToChoose' times, multiplying the result
    for ( let idx = 0; idx < itemsToChoose; idx++ ) {
        resultValue *= totalItems - idx; // Multiply by (n), then (n-1), etc.
    }

    return resultValue; // Return the final permutation count
};

/*
 * This routine computes the number of combinations (selections)
 * of 'subsetSize' items from a set of 'universeSize' distinct items.
 * Formula: C(n, r) = P(n, r) / P(r, r)
 */
const determineSelection = ( universeSize, subsetSize ) => {
    // Utilize the permutation function for calculation, dividing P(n,r) by P(r,r)
    return calculateArrangement( universeSize, subsetSize ) / calculateArrangement( subsetSize, subsetSize );
};


/*
 * The primary execution function that processes input data.
 * It finds an element in a sorted array that is closest to half of the first element.
 */
const processInputData = ( inputString ) => {
    // Clean and split the input string into an array of lines based on newline characters
    inputString = inputString.trim().split( "\n" );

    // Parse the first line as the total count of elements (though not directly used in the current problem logic)
    const countElements = parseInt( inputString[0], 10 );

    // Parse the second line, convert space-separated numbers, and sort them in descending order
    const dataArray = inputString[1]
        .split( " " )
        .map( numStr => parseInt( numStr, 10 ) ) // Convert each string number to an integer (base 10)
        .sort( ( valA, valB ) => valB - valA ); // Sort numerically in descending order

    // Calculate the midpoint value, which is half of the largest element (first element after sorting)
    let midpointValue = dataArray[0] / 2;

    // Initialize minimum difference to an extremely large number to ensure the first comparison passes
    let minimumDifference = Infinity;

    // Variable to store the array element that is found to be closest to the midpointValue
    let closestElement;

    // Iterate through the indices of the dataArray to find the element closest to the midpoint
    for ( let currentIndex in dataArray ) {
        const currentDifference = Math.abs( midpointValue - dataArray[currentIndex] ); // Calculate absolute difference
        if ( currentDifference < minimumDifference ) {
            minimumDifference = currentDifference; // If a smaller difference is found, update minimumDifference
            closestElement = dataArray[currentIndex]; // Store this element as the current closest
        }
    }

    // Output the largest element of the array (dataArray[0]) and the element found closest to its half
    console.log( dataArray[0] + " " + closestElement );
};

// Execute the main processing function with data read synchronously from standard input
processInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );