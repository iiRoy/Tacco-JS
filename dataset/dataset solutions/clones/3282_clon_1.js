/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same.
 * Only whitespace (indentation, spacing, blank lines) and comments have been modified
 * to make the code visually different while preserving its logical and structural identity.
 */
function   Main   ( input )
{
    // The input string is split by newline characters to get an array of lines.
    input = input . split ( "\n" ) ;

    // Parse the first line to get the value of N.
    var   N   =   parseInt ( input [ 0 ] ) ;

    // Parse parts of the second line to get A and B.
    var   A   =   parseInt ( input [ 1 ] . split ( " " ) [ 0 ] ) ;
    var   B   =   parseInt ( input [ 1 ] . split ( " " ) [ 1 ] ) ;


    // Initialize three arrays to categorize numbers.
    P1   =   new   Array ( ) ;
    P2   =   new   Array ( ) ;
    P3   =   new   Array ( ) ;

    /*
     * Temporary variable to hold the split third line.
     * This line contains the numbers to be categorized.
     */
    tmp = input [ 2 ] . split ( " " ) ;

    // Loop through the numbers from the third line.
    for ( var   i = 0 ; i < N ; i ++ ) {
        // Parse the current number P.
        P = parseInt ( tmp [ i ] ) ;

        // Categorize P based on its value relative to A and B.
        if ( P <= A ) {
            P1 . push ( P ) ; // P is less than or equal to A
        } else   if   ( P <= B ) {
            P2 . push ( P ) ; // P is greater than A but less than or equal to B
        } else {
            P3 . push ( P ) ; // P is greater than B
        }
    }


    // Calculate the minimum length among the three arrays.
    var   ans   =   Math . min ( P1 . length , P2 . length , P3 . length ) ;

    // Output the final answer.
    console . log ( '%s' , ans ) ;
}


// This function is intended for debugging purposes, typically triggered by a UI element.
function   debug   ( )
{
    var   input   =   document . getElementById ( "input" ) . value ;
    Main ( input ) ;
}


// Main execution path: Read input from stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;