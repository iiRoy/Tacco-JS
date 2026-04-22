/* This is a JavaScript program. */ // Main entry point for the application.

function Main  ( arg ) { /* Function definition starts here */

    // Process the input argument.
    arg  =  arg . split ( "\n" ) [ 0 ] ; // Take the first line of input.

    /*
     * Declare and initialize several variables
     * by parsing the input string.
     * These variables represent dimensions and coordinates.
     */
    var   H   =   arg . split ( " " ) [ 0 ] - 0 ; // Height parameter.
    var   W   =   arg . split ( " " ) [ 1 ] - 0 ; // Width parameter.
    var   A   =   arg . split ( " " ) [ 2 ] - 0 ; // A-coordinate.
    var   B   =   arg . split ( " " ) [ 3 ] - 0 ; // B-coordinate.


    var   tmp   =   new   Array ( W ) . fill ( 0 ) ; // Temporary array initialized with zeros.
    var   ans   =   [ ] ; // This will store the final 2D array (matrix).

    /*
     * Outer loop: iterates through rows (H).
     * This loop builds each row of the final 'ans' matrix.
     */
    for   ( var   i   =   0 ;   i   <   H ;   i ++ )   {

        // Inner loop: iterates through columns (W).
        // Determines the value for each cell in the current row.
        for   ( var   j   =   0 ;   j   <   W ;   j ++ )   {

            // Conditional logic to determine the cell value (0 or 1).
            // This creates a pattern based on A and B coordinates.
            if   ( j   <   A   &&   i   <   B )   {
                tmp [ j ]   =   0 ; // Cell value is 0.
            }
            else   if ( j   >=   A   &&   i   <   B )   {
                tmp [ j ]   =   1 ; // Cell value is 1.
            }
            else   if ( j   <   A   &&   i   >=   B )   {
                tmp [ j ]   =   1 ; // Cell value is 1.
            }
            else   if ( j   >=   A   &&   i   >=   B )   {
                tmp [ j ]   =   0 ; // Cell value is 0.
            }

        }
        // After filling the temporary row 'tmp', add a copy to 'ans'.
        ans [ i ]   =   tmp . slice ( ) ;
        // Reset 'tmp' for the next row.
        tmp . fill ( 0 ) ;
    } // End of outer loop for matrix construction.


    // Output the resulting matrix to the console.
    /*
     * This loop iterates through each row of the 'ans' matrix
     * and prints it as a joined string without separators.
     */
    for   ( var   i   =   0 ;   i   <   H ;   i ++ )   {
        console . log ( ans [ i ] . join ( "" ) ) ; // Print the row.
    }
} // End of Main function.

// Call the Main function with input from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Execute the program.