( function () { /* This is an Immediately Invoked Function Expression (IIFE)
                                 * used to encapsulate the code and prevent global scope pollution.
                                 */

    // Variable to store all incoming data from standard input.
    var   input = '';

    /**
     * The primary entry point function for processing the input data.
     * It orchestrates the parsing, sorting, and output.
     */
    function main () {
        var     i,
                len,
                n,          // This variable 'n' is declared but never used.
                inputNum,
                nums,
                numAry = [], // Array to hold parsed numbers.
                result = ''; // String to build the final output.

        // The first line of input specifies the length of the array.
        len = +input[0]; // Convert the first input line (string) to a number.

        // The second line of input contains the space-separated numbers.
        inputNum = input[1];

        // Split the string of numbers into an array of string numbers.
        nums = inputNum.split(' ');


        // Loop through the 'nums' array to parse each string into an integer
        // and populate the 'numAry'.
        for ( i = 0 ; i < len ; i += 1 ) {
            numAry.push( parseInt( nums[i], 10 ) ); // Use radix 10 for safe parsing.
        }

        // Call the quickSort algorithm to sort the 'numAry' in-place.
        // The array is sorted from index 0 to len - 1.
        quickSort( numAry, 0, len - 1 );


        // After sorting, iterate through the sorted array to construct the
        // final result string, adding a space after each number.
        for ( i = 0, len = numAry.length ; i < len ; i += 1 ) {
            result += numAry[i] + ' ';
        }
        // Output the sorted numbers to the console.
        console.log( result );
    }

    /**
     * Implements the QuickSort algorithm recursively.
     * This function sorts the 'numArray' in ascending order.
     * @param {Array<number>} numArray The array of numbers to be sorted.
     * @param {number} left The starting index of the sub-array to be sorted.
     * @param {number} right The ending index of the sub-array to be sorted.
     */
    function quickSort ( numArray, left, right ) {
        var   pr,    // Pointer for the right side of the partition.
              pl,    // Pointer for the left side of the partition.
              pivot, // The pivot element chosen for partitioning.
              temp;  // Temporary variable used for swapping elements.

        // Only proceed if there is more than one element to sort in the sub-array.
        if ( left < right ) {

            pl = left;   // Initialize left pointer.
            pr = right;  // Initialize right pointer.

            // Select the pivot using the median-of-three strategy
            // to improve performance for already sorted or reverse-sorted arrays.
            pivot = getMedian( numArray[pl], numArray[pr], numArray[ ( pl + pr ) / 2 ] );

            do {
                // Move 'pl' to the right as long as elements are less than the pivot.
                while ( numArray[pl] < pivot ) {
                    pl += 1;
                }

                // Move 'pr' to the left as long as elements are greater than the pivot.
                while ( numArray[pr] > pivot ) {
                    pr -= 1;
                }

                // If pointers have crossed or met, the partition is complete.
                if ( pl >= pr ) {
                    break; // Exit the do-while loop.
                } else {
                    // Otherwise, swap the elements at 'pl' and 'pr' positions.
                    temp = numArray[pl];
                    numArray[pl] = numArray[pr];
                    numArray[pr] = temp;

                    // Move pointers inward after swap.
                    pl += 1;
                    pr -= 1;
                }
            } while ( pl <= pr ); // Continue partitioning until pointers cross.

            // Recursively sort the left sub-array.
            quickSort( numArray, left, pl - 1 );
            // Recursively sort the right sub-array.
            quickSort( numArray, pr + 1, right );
        }
    }

    /**
     * Calculates the median of three numbers.
     * Used in QuickSort for pivot selection to improve average-case performance.
     * @param {number} x The first number.
     * @param {number} y The second number.
     * @param {number} z The third number.
     * @returns {number} The median of the three input numbers.
     */
    function getMedian ( x, y, z ) {
        // This is a compact ternary expression to find the median.
        // It compares x, y, and z to determine the middle value.
        return ( x <= y ) ? ( ( y <= z ) ? y : ( ( x < z ) ? z : x ) ) : ( ( x <= z ) ? x : ( ( y < z ) ? z : y ) ) ;
    }


    // Standard input handling for Node.js environment.

    // Resume the stdin stream to start receiving data.
    process.stdin.resume();

    // Set the encoding for incoming data to UTF-8.
    process.stdin.setEncoding( 'utf8' );

    // Event listener for 'data' chunks received from stdin.
    // Each chunk is appended to the 'input' string.
    process.stdin.on( 'data', function ( chunk ) {
        input += chunk;
    } );

    // Event listener for 'end' of stdin stream.
    // This indicates all input has been received.
    process.stdin.on( 'end', function () {
        // Split the accumulated input string by newlines into an array of lines.
        input = input.split( '\n' );
        // Call the main function to start processing the input.
        main();
    } );

}() ); // End of the IIFE.