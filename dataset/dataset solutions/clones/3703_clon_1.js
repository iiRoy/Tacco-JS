function sadness ( b , A ) {
    /*
     * This function calculates a "sadness" score for a given
     * base value 'b' and an array 'A'.
     * It iterates through the array and sums the absolute differences
     * between each element A[i] and a calculated target value (b + i + 1).
     *
     * @param {number} b - The base value for the calculation.
     * @param {Array<number>} A - The input array of numbers.
     * @returns {number} The total sadness score.
     */
    var result = 0 ; // Initialize the accumulator for the sadness score.

    // Loop through each element of the input array 'A'.
    for ( var i = 0 ; i < A . length ; i ++ ) {
        // Calculate the target value for the current element: b + i + 1.
        // Then, find the absolute difference between A[i] and this target.
        // Add this absolute difference to the 'result'.
        result += Math . abs ( A [ i ] - ( b + i + 1 ) ) ;
    }

    // Return the final calculated sadness score.
    return result ;
}


/*
 * The main entry point of the program.
 * It reads input, processes it to find an optimal 'b' value,
 * and then calculates and prints the minimum 'sadness' score.
 */
function main ( input ) {

    // Split the input string into an array of lines.
    const lines = input . split ( '\n' ) ;

    // Parse the first line to get the integer N.
    const N = parseInt ( lines [ 0 ] ) ;

    // Parse the second line: split by space, then map each part to an integer.
    const As = lines [ 1 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) ;


    // Calculate the median index for an array of size N.
    // For N=5, median_index = floor(5/2) = 2.
    // For N=4, median_index = floor(4/2) = 2.
    const median_index = Math . floor ( N / 2 ) ;

    // Declare an array to store differences.
    var A_diffs = [ ] ;

    // Populate A_diffs: A_diffs[i] = As[i] - (i + 1).
    // This transformation is crucial for the problem's logic.
    for ( var i = 0 ; i < As . length ; i ++ ) {
        A_diffs . push ( As [ i ] - ( i + 1 ) ) ;
    }

    // The initial candidate for 'b' is the element at the median_index in A_diffs.
    const b = A_diffs [ median_index ] ;


    // The following lines were previously used for debugging; they are now commented out
    // to keep the output clean while demonstrating comment modification.
    // console.log(N);
    // console.log(As);
    // console.log(A_diffs);
    // console.log([sadness(b, As), sadness(b+1, As)]);


    // Calculate the minimum sadness score by evaluating 'sadness' for three candidate 'b' values:
    // 1. The calculated 'b' (median of A_diffs).
    // 2. The element after the median in A_diffs.
    // 3. The element two positions after the median in A_diffs.
    // Note: The problem context usually implies these three points cover the optimal 'b' for this specific transformation.
    var result = Math . min ( sadness ( b , As ) ,
                              sadness ( A_diffs [ median_index + 1 ] , As ) ,
                              sadness ( A_diffs [ median_index + 2 ] , As ) ) ;


    // Print the final minimum sadness result to the console.
    console . log ( result ) ;
}

// Execute the main function by reading input from standard input.
// This is a common pattern in competitive programming environments in Node.js.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

/* End of program */