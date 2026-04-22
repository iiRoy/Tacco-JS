/*
 * This JavaScript file processes input from stdin,
 * performs a partitioning operation similar to Quicksort's
 * partition step, and then prints the result.
 */
let inputString = ''; // Initialize an empty string to accumulate input.


// Register a listener for the 'data' event on standard input.
// This event fires when data is available to be read.
process.stdin.on( 'data', inputStdin => {
        // Append the incoming data chunk to the inputString.
    inputString += inputStdin;
} );

// Register a listener for the 'end' event on standard input.
// This event fires when no more data will be read.
process.stdin.on( 'end', function () {
    // Trim trailing whitespace from the entire input string,
    // then split it into an array of lines.
    // Each line is also trimmed of trailing whitespace.
    inputString = inputString.replace( /\s*$/, '' )
        .split( '\n' )
            .map( str => str.replace( /\s*$/, '' ) );


    // Call the main processing function with the second line of input.
    // The second line is split by spaces and converted to numbers.
    proc( inputString[1].split( ' ' ).map( str => Number( str ) ) );
} );

/**
 * The main processing function.
 * It takes an array of numbers, partitions them, and prints the result.
 * @param {Array<Number>} nums - The array of numbers to process.
 */
const proc = ( nums ) => {
    // Perform the partition operation and get the pivot's final index.
    const index = partition( nums, 0, nums.length - 1 );

    // Print the array, highlighting the pivot element with square brackets.
    console.log(
        nums
            .map( ( num, i ) => i === index ? `[${num}]` : String( num ) )
            .join( ' ' )
    );
};

/**
 * Partitions a sub-array around a pivot element (Lomuto partition scheme).
 * The pivot is chosen as the last element of the sub-array.
 * Elements less than or equal to the pivot are moved to its left,
 * and elements greater than the pivot are moved to its right.
 *
 * @param {Array<Number>} arr - The array to be partitioned.
 * @param {Number} p - The starting index of the sub-array.
 * @param {Number} r - The ending index of the sub-array (inclusive), which is also the pivot's initial position.
 * @returns {Number} The final index of the pivot element after partitioning.
 */
const partition = ( arr, p, r ) => {
    // Select the last element as the pivot.
    const x = arr[r];
    // i will be the index of the last element less than or equal to the pivot.
    let i = p - 1;

    // Iterate through the sub-array from p to r-1.
    for ( let j = p; j < r; j++ ) {
        // If the current element is less than or equal to the pivot.
        if ( arr[j] <= x ) {
            // Increment i, as we found another element for the 'less than or equal' partition.
            i = i + 1;

            // Swap arr[i] and arr[j].
            // These temporary variables are used to maintain exact identifier names.
            const needToBeInLeft = arr[j];
            const needToBeInRight = arr[i];
            arr[i] = needToBeInLeft;
            arr[j] = needToBeInRight;
        }
    }

    // Place the pivot (originally at arr[r]) into its correct sorted position.
    // It should be placed right after all elements less than or equal to it (at index i).
    const needToBeInRight = arr[r]; // Value of the pivot
    const needToBeInLeft = arr[i + 1]; // Value at the position where pivot should go
    arr[i + 1] = needToBeInRight; // Move pivot to its final place
    arr[r] = needToBeInLeft; // Move the element that was at i+1 to the pivot's original place

    // Return the final index of the pivot.
    return i + 1;
};