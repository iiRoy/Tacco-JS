/*
 * This is a utility function.
 * It reverses a binary digit.
 * If the input is 0, it returns 1.
 * If the input is anything else (implicitly 1 in binary context), it returns 0.
 */
function     reverse     ( a ) {
    // Check if 'a' is strictly equal to 0.
    return   a   ===   0   ?   1   :   0   ;
}


// Main function to process the input and generate the output grid.
function   Main   ( input   )   {

    // Split the input string:
    // 1. By newline to get the first line.
    // 2. By space to get individual string numbers.
    // 3. Map each string number to an integer.
    const   tmp   =   input . split ( "\n" ) [ 0 ] . split ( " " ) . map ( ( v )   =>   ( parseInt ( v ) ) ) ;

    // Log the parsed temporary array for debugging purposes.
    console . log ( tmp ) ;


    // Destructure or assign parsed values to meaningful variables.
    const   h   = tmp [ 0 ] ; // Height of the grid.
    const   w   = tmp [ 1 ] ; // Width of the grid.
    const   a   = tmp [ 2 ] ; // Parameter 'a' for column pattern.
    const   b   = tmp [ 3 ] ; // Parameter 'b' for row pattern.


    // Generate the answer grid.
    // First, create rows based on 'h' and 'b'.
    // Then, for each row, create columns based on 'w' and 'a', using the 'reverse' function.
    const   ans   =   [ ... Array ( h ) . keys ( ) ]
        . map ( ( v ) =>   v   <   b   ?   0   :   1 ) // Determine the base value for each row.
        . map ( ( v ) => {
            return   [ ... Array ( w ) . keys ( ) ]
                . map ( ( x )   =>   x   <   a   ?   v   :   reverse ( v ) ) ; // Determine column values based on 'a' and row's base value.
        } ) ;


    // Format the answer grid for output:
    // 1. Join inner arrays (rows) into strings.
    // 2. Join these row strings with newlines.
    // 3. Add a final newline character at the end.
    console . log ( ans . map ( ( v )   =>   v . join ( "" ) ) . join ( "\n" )   +   "\n" ) ;
}


// Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;