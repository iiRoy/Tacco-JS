"use strict";

/*
 * This function performs a binary search on a sorted array
 * to find the insertion point for a given value.
 * It returns the index where the value should be inserted
 * to maintain sorted order, or the index if the value is found.
 *
 * @param {Array<number>} array The sorted array to search within.
 * @param {number} value The value to search for.
 * @returns {number} The index where the value is found or should be inserted.
 */
function binarySearch(  array,  value  ) {

    // Initialize the starting index of the search range.
    let start = 0;

    // Initialize the ending index of the search range.
    let stop = array.length - 1;

    // Calculate the initial middle index.
    let middle = Math.floor( ( start + stop ) / 2 );

    // Loop until the value is found or the search range collapses.
    while (  array[middle] !== value  &&  start < stop  ) {

        // Check if the target value is in the left half.
        if (  value < array[middle]  ) {

            stop = middle - 1; // Adjust the stop index.

        } else { // Value must be in the right half.

            start = middle + 1; // Adjust the start index.

        }

        // Recalculate the middle index for the new range.
        middle = Math.floor( ( start + stop ) / 2 );

    }

    /*
     * After the loop, the 'middle' index points to either the value
     * or the closest element. We need to determine the correct insertion point.
     */

    // If the element at 'middle' is greater than the target value,
    // then 'middle' is the correct insertion point.
    if (  array[middle] > value  )  return middle ;

    // If the element at 'middle' is less than the target value,
    // then the insertion point is one position after 'middle'.
    if (  array[middle] < value  )  return middle + 1 ;

    // If array[middle] === value, return middle.
    // Otherwise (array[middle] !== value and start >= stop),
    // it means the value was not found and 'middle' is the closest.
    // In this case, if array[middle] is still not the value,
    // it implies value > array[middle-1] and value < array[middle]
    // or value > array[middle] and value < array[middle+1]
    // The previous two if statements cover the boundary cases.
    // This final return handles the exact match or the case where
    // 'middle' is the correct insertion point for a non-found value.
    return (  array[middle] !== value  )  ?  middle + 1  :  middle ;

}



/**
 * Main function to process input and solve the problem.
 * This function reads temple and shrine locations, then
 * calculates minimum travel distances for queries.
 *
 * @param {string} input The raw input string containing all data.
 */
function Main(  input  ) {

    // Define a constant for infinity, used for initial minimum distance.
    const INF = Number.MAX_SAFE_INTEGER;

    // Split the input string into individual lines.
    let lines = input.split( "\n" );

    // Parse the first line to get A, B, and Q values.
    // A: number of shrines, B: number of temples, Q: number of queries.
    let ABQ = lines.shift().split( /\s/ ).map( (v) => v - 0 );

    // Extract A, B, Q from the parsed array.
    let A = ABQ[0];
    let B = ABQ[1];
    let Q = ABQ[2];

    // Initialize array 's' for shrine locations.
    // Add -INF at the beginning to handle boundary cases in binary search.
    let s = [ -INF ];

    // Populate the shrine locations array 's'.
    // Each line is converted to a number.
    for (  let a = 1;  a <= A;  a++  ) {

        s.push(  lines.shift() - 0  ); // Convert string to number.

    }

    // Add INF at the end of 's' for boundary cases.
    s.push( INF );


    // Initialize array 't' for temple locations.
    // Add -INF at the beginning to handle boundary cases in binary search.
    let t = [ -INF ];

    // Populate the temple locations array 't'.
    // Each line is converted to a number.
    for (  let b = 1;  b <= B;  b++  ) {

        t.push(  lines.shift() - 0  ); // Convert string to number.

    }

    // Add INF at the end of 't' for boundary cases.
    t.push( INF );


    /**
     * Helper function to find the minimum of three numbers.
     * @param {number} a First number.
     * @param {number} b Second number.
     * @param {number} c Third number.
     * @returns {number} The smallest of the three numbers.
     */
    const min = (  a,  b,  c  ) => {

        return Math.min(  a,  Math.min( b, c )  );

    }


    // Process each query.
    for (  let q = 0;  q < Q;  q++  ) {

        // Get the current query location 'x'.
        let x = lines.shift() - 0;

        // Find the insertion point for 'x' in the shrine array 's'.
        let b = binarySearch(  s,  x  );

        // Find the insertion point for 'x' in the temple array 't'.
        let d = binarySearch(  t,  x  );

        // Initialize the minimum result for the current query to infinity.
        let res = INF;

        // Iterate through potential shrine locations around 'x'.
        // These are s[b-1] (the largest shrine <= x) and s[b] (the smallest shrine >= x).
        for (  let S  of  [ s[b - 1], s[b] ]  ) {

            // Iterate through potential temple locations around 'x'.
            // These are t[d-1] (the largest temple <= x) and t[d] (the smallest temple >= x).
            for (  let T  of  [ t[d - 1], t[d] ]  ) {

                // Calculate distance type 1: |S - x| + |T - S|
                // Go from x to S, then from S to T.
                const d1 = Math.abs( S - x ) + Math.abs( T - S );

                // Calculate distance type 2: |T - x| + |S - T|
                // Go from x to T, then from T to S.
                const d2 = Math.abs( T - x ) + Math.abs( S - T );

                // Update the minimum result with the smallest of current res, d1, and d2.
                res = min( res, d1, d2 );

            }

        }

        // Output the minimum distance for the current query.
        console.log(  res  );

    }

}

// Execute the Main function with input read from standard input.
Main(  require( "fs" ).readFileSync( "/dev/stdin", "utf8" )  );