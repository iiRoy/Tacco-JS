/* This is a highly optimized JavaScript solution for a specific algorithmic problem.
 * It processes input from standard input, performs calculations, and outputs a result.
 * The entire logic is encapsulated within an immediately invoked arrow function.
 */
console.log( ( ( args ) => { // Start of the main anonymous function execution block.

    // -------------------------------------------------------------------------
    // Input Parsing Section:
    // This section handles the initial processing of the raw input string.
    // It expects a specific format: the first line contains N, subsequent lines contain array elements.
    // -------------------------------------------------------------------------

    /*
     * The input 'args' string is first trimmed to remove any leading/trailing whitespace.
     * Then, it's split by newline characters to get individual lines.
     * Each line is then mapped:
     *   - It's split by spaces to get string representations of numbers.
     *   - Each string is converted to an integer using parseInt.
     * The result is a nested array. Destructuring assignment is used to extract:
     *   - N: The first element of the first line (representing the count).
     *   - A: The second line, which becomes the array of numbers.
     */
    const [
        [ N ], /* N represents the total number of elements, extracted from the first line. */
        A      /* A is the array of numbers, extracted from the second line of input. */
    ] = args  // The raw input string.
        .trim() // Remove whitespace from both ends of the string.
        .split( '\n' ) // Split the string into an array of lines.
        .map( r => r.split( ' ' ).map( v => parseInt( v ) ) ); // Parse each line into an array of integers.


    // -------------------------------------------------------------------------
    // Array Sorting Section:
    // The array 'A' is sorted in descending order.
    // -------------------------------------------------------------------------

    A .sort( ( a, b ) => b - a ); // Sort array A in descending order.

    // -------------------------------------------------------------------------
    // Binary Search-like Partitioning Logic:
    // This part identifies a pivot point 'r' in the sorted array 'A'.
    // It's effectively looking for the boundary between non-negative and negative numbers.
    // -------------------------------------------------------------------------

    let l = 0; // 'l' acts as the left pointer for the search range.
    let r = N - 1; // 'r' acts as the right pointer for the search range.

    // The loop continues as long as the search window has more than one element.
    while ( r - l > 1 ) {

        // Calculate the middle index 'm'. Using bitwise OR 0 for floor division.
        const m = l + ( ( r - l ) / 2 | 0 );

        // If the element at 'm' is negative, it means all elements from 'm' to 'r'
        // could potentially be negative, so we narrow the search to the left half.
        if ( A[ m ] < 0 ) {
            r = m; /* Move the right pointer to 'm'. */
        }
        else {
            // Otherwise, A[m] is non-negative. All elements from 'l' to 'm'
            // are non-negative, so we narrow the search to the right half.
            l = m; /* Move the left pointer to 'm'. */
        }

    } // End of while loop for partitioning.

    // -------------------------------------------------------------------------
    // Main Calculation and Path Construction Section:
    // This part uses the partitioned array to construct a sequence of operations.
    // -------------------------------------------------------------------------

    const q = []; // 'q' will store the sequence of operations as strings.

    // Initialize 'b' with the largest element and 'c' with the smallest element.
    let b = A[ 0 ]; // 'b' starts with the first element of the sorted array.
    let c = A[ A.length - 1 ]; // 'c' starts with the last element of the sorted array.

    // 'B' contains elements from index 1 up to (but not including) 'r'.
    // These are generally the positive or zero elements, excluding the largest one.
    const B = A.slice( 1, r );

    // 'C' contains elements from index 'r' up to (but not including) the last one.
    // These are generally the negative elements, excluding the smallest one.
    const C = A.slice( r, A.length - 1 );


    /* Process the 'B' array (elements generally >= 0). */
    while ( B.length ) {
        const b_val_from_B = B.pop(); // Take an element from the end of B.
        q.push( `${ c } ${ b_val_from_B }` ); // Record the operation.
        c -= b_val_from_B; // Update 'c' by subtracting the element.
    }

    // After processing B, perform one operation with the initial 'b' and current 'c'.
    q.push( `${ b } ${ c }` ); // Record this crucial intermediate operation.
    b -= c; // Update 'b' with the result.

    /* Process the 'C' array (elements generally < 0). */
    while ( C.length ) {
        const c_val_from_C = C.pop(); // Take an element from the end of C.
        q.push( `${ b } ${ c_val_from_C }` ); // Record the operation.
        b -= c_val_from_C; // Update 'b' by subtracting the element.
    }

    // -------------------------------------------------------------------------
    // Result Formatting and Return:
    // The final result is composed of the last value of 'b' and the recorded operations.
    // -------------------------------------------------------------------------

    return `${ b }\n` + q .join( '\n' ); // Return the final 'b' and all recorded operations, separated by newlines.

} ) ( // End of the main anonymous function definition.

    /*
     * Input Source:
     * This immediately invoked function reads its arguments from standard input.
     * It uses Node.js 'fs' module to synchronously read the entire file
     * at '/dev/stdin' as a UTF-8 string.
     */
    require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' )

) ); // End of console.log and function invocation.