var  input  =  ''  ; // This variable will store all incoming data from stdin.

var    readable    =    process.stdin    ; // Reference to the standard input stream.


readable . resume ( ) ; /*
                         * Start reading data from the standard input.
                         * Without this, the stream would remain paused.
                         */

readable . setEncoding ( 'utf-8' ) ; // Ensure data is interpreted as UTF-8 characters.

readable . on (  'data'  ,  function  (  chunk  )  {
    // Event listener: This function is called whenever new data (a 'chunk') arrives.
    input   +=   chunk   ; // Append the new chunk to the 'input' string.
}  )  ;


readable . on (  'end'  ,  function  (  )  {
    // Event listener: This function is called once all input data has been received.

    /*
     * The following code block processes the entire accumulated input.
     * It parses matrix and vector data from the input string.
     */
    var   data   =   input . split ( '\n' ) ; // Split the input string into an array of lines.

    // The first line of input is expected to contain the dimensions 'n' and 'm'.
    var   nm   =   data [ 0 ] . split ( ' ' ) ;
    var   n   =   parseInt ( nm [ 0 ] ) ; // 'n' represents the number of rows for matrix A.
    var   m   =   parseInt ( nm [ 1 ] ) ; // 'm' represents the number of columns for matrix A, and the size of vector b.


    // Initialize matrix A with 'n' rows.
    var   A   =   new   Array ( n ) ;
    var   k   =   0 ; // 'k' will serve as an index for populating the rows of A.

    // Loop through the input data to populate matrix A.
    // Rows for A start from data[1] up to data[n].
    for ( var   i = 1 ;   i <= n ;   i ++   ) {
        // Parse each line into an array of numbers for the current row.
        var   x   =   data [ i ] . split ( ' ' ) . map ( Number ) ;

        A [ k ]   =   new   Array ( ) ; // Create a new inner array for the current row of A.

        // Populate the elements of the current row A[k].
        for ( var   j = 0 ;   j < m ;   j ++   ) {
            A [ k ] [ j ]   =   x [ j ] ; // Assign the parsed number to the matrix element.
        }
        k ++ ; // Move to the next row index for A.
    }

    // Initialize vector b with 'm' elements.
    var   b   =   new   Array ( m ) ;
    k   =   0 ; // Reset 'k' to be used as an index for populating vector b.

    // Loop through the input data to populate vector b.
    // Elements for b start from data[n+1] up to data[n+m].
    for ( var   i = n + 1 ;   i <= n + m ;   i ++   ) {
        // Parse each line; it's expected to contain a single number for each element of b.
        // The result 'x' will be an array like [number]. JavaScript will coerce this to 'number' during multiplication.
        var   x   =   data [ i ] . split ( ' ' ) . map ( Number ) ;
        b [ k ++ ]   =   x ; // Store the parsed array (e.g., [5]) into vector b.
    }

    // Initialize vector c, which will store the result of the matrix-vector multiplication (A * b).
    var   c   =   new   Array ( n ) ;

    // Perform the matrix-vector multiplication: c = A * b.
    // This involves iterating through each row of A and multiplying it by vector b.
    for ( var   i = 0 ;   i < n ;   i ++   ) {
        c [ i ]   =   0 ; // Initialize the current element of c to zero before summation.
        for ( var   j = 0 ;   j < m ;   j ++   ) {
            // Multiply corresponding elements and add to the sum for c[i].
            // JavaScript implicitly converts b[j] (which is [number]) to number for multiplication.
            c [ i ]   +=   A [ i ] [ j ] * b [ j ] ;
        }
    }

    // Output the resulting vector c. Each element is joined by a newline character.
    console . log (   c . join ( '\n' )   ) ;
}  )  ; // End of the 'end' event handler function.