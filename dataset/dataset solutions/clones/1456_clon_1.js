( function ( ) {
    // This immediately invoked function expression (IIFE) encapsulates the application logic.

    var input = ''; // Variable to store all incoming data from standard input.

    /**
     * The main function responsible for processing the input and orchestrating the sorting.
     */
    function main ( ) {
        // Declare local variables for the main function.
        var i, len, n, inputNum, nums, numAry = [ ], result = '';

        // The first line of input specifies the number of elements.
        // The '+' operator converts the string to a number.
        len = + input[ 0 ];

        // The second line of input contains the numbers as a space-separated string.
        inputNum = input[ 1 ];

        // Split the string of numbers into an array of strings.
        nums = inputNum.split( ' ' );

        // Iterate through the string array, parse each element to an integer,
        // and push it into the 'numAry' array.
        for ( i = 0; i < len; i += 1 ) {
            numAry.push( parseInt( nums[ i ], 10 ) );
        }

        // Call the quickSort algorithm to sort the array of numbers.
        // It sorts the entire array from index 0 to len - 1.
        quickSort( numAry, 0, len - 1 );

        // After sorting, construct the result string with space-separated numbers.
        for ( i = 0; i < len; i += 1 ) {
            // Append a space after each number, except for the last one.
            if ( i != len - 1 ) {
                result += numAry[ i ] + ' ';
            }
            // For the last number, just append the number itself without a trailing space.
            else {
                result += numAry[ i ];
            }
        }

        // Output the sorted numbers to the console.
        console.log( result );
    }

    /**
     * Implements the QuickSort algorithm to sort an array in-place.
     * @param {Array<number>} numArray - The array of numbers to be sorted.
     * @param {number} left - The starting index of the sub-array to sort.
     * @param {number} right - The ending index of the sub-array to sort.
     */
    function quickSort ( numArray, left, right ) {
        // Declare variables for partition pointers, pivot, and temporary storage.
        var pr, pl, pivot, temp;

        // Only proceed if the sub-array has more than one element.
        if ( left < right ) {
            pl = left;   // 'pl' is the left pointer, starting at 'left'.
            pr = right;  // 'pr' is the right pointer, starting at 'right'.

            // Choose a pivot using the median-of-three strategy to improve performance.
            // This helps in avoiding worst-case scenarios for already sorted or reverse-sorted arrays.
            pivot = getMedian( numArray[ pl ], numArray[ pr ], numArray[ ( pl + pr ) / 2 ] );

            // Main partitioning loop.
            do {
                // Move 'pl' to the right while elements are less than the pivot.
                while ( numArray[ pl ] < pivot ) {
                    pl += 1;
                }

                // Move 'pr' to the left while elements are greater than the pivot.
                while ( numArray[ pr ] > pivot ) {
                    pr -= 1;
                }

                // If pointers have crossed or met, the partition is complete.
                if ( pl >= pr ) {
                    break;
                }
                // If pointers have not crossed, swap the elements at 'pl' and 'pr'.
                else {
                    temp = numArray[ pl ];
                    numArray[ pl ] = numArray[ pr ];
                    numArray[ pr ] = temp;

                    // Move pointers inward after a swap.
                    pl += 1;
                    pr -= 1;
                }
            } while ( pl <= pr ); // Continue as long as pointers haven't fully crossed.

            // Recursively call quickSort on the left sub-array.
            quickSort( numArray, left, pl - 1 );
            // Recursively call quickSort on the right sub-array.
            quickSort( numArray, pr + 1, right );
        }
    }

    /**
     * Calculates the median of three numbers. Used for pivot selection in QuickSort.
     * @param {number} x - The first number.
     * @param {number} y - The second number.
     * @param {number} z - The third number.
     * @returns {number} The median of the three input numbers.
     */
    function getMedian ( x, y, z ) {
        // This is a compact ternary expression to find the median.
        // It handles all six possible orderings of x, y, and z.
        return ( x <= y ) ? ( ( y <= z ) ? y : ( ( x < z ) ? z : x ) ) : ( ( x <= z ) ? x : ( ( y < z ) ? z : y ) );
    }

    // Set up standard input processing.
    // Ensure the process doesn't exit immediately.
    process.stdin.resume( );
    // Set the encoding for incoming data.
    process.stdin.setEncoding( 'utf8' );

    // Event listener for incoming data chunks.
    process.stdin.on( 'data', function ( chunk ) {
        // Append each chunk of data to the 'input' string.
        input += chunk;
    } );

    // Event listener for the end of input stream.
    process.stdin.on( 'end', function ( ) {
        // When all input is received, split the accumulated string by newline characters.
        input = input.split( '\n' );
        // Call the main function to start processing.
        main( );
    } );

}( ) ); // End of the IIFE.