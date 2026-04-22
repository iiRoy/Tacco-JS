// This is the primary function responsible for processing the program's input.
function   Main   (   input   )
{
    // The raw input string is split into an array of strings,
    // with each element corresponding to a line from the input.
    input   =   input . split ( "\n" ) ;

    /*
     * The first line of the input array is extracted.
     * This line is expected to contain space-separated values.
     */
    var   count   =   input [ 0 ] ;

    // The 'count' string is then split by spaces to isolate individual numeric components.
    // These components are assigned to constants a, b, c, and d.
    const   a   =   count . split ( " " ) [ 0 ] ; // Represents the first parsed number.
    const   b   =   count . split ( " " ) [ 1 ] ; // Represents the second parsed number.
    const   c   =   count . split ( " " ) [ 2 ] ; // Represents the third parsed number.
    const   d   =   count . split ( " " ) [ 3 ] ; // Represents the fourth parsed number (though not used in the final calculation).

    // A calculation is performed: 'b' minus 'c' minus 'a'.
    // The outcome is stored in the 'result' constant.
    const   result   =   b   -   c   -   a ;

    // A conditional check is initiated.
    // It evaluates whether the value of 'b' is strictly less than 'c'.
    if   (   b   <   c   )
    {
        // If 'b' is indeed less than 'c', the program outputs the integer 0.
        console . log ( 0 ) ;
    }
    else
    {
        // Otherwise (if 'b' is not less than 'c'), the program outputs the previously
        // computed 'result' value.
        console . log ( result ) ;
    }
} // End of the Main function.


// This line initiates the program by calling the Main function.
// It reads the entire content of standard input (typically '/dev/stdin' in competitive programming environments)
// synchronously, decoding it as UTF-8, and passes it as the 'input' argument to the Main function.
Main   (   require   (   "fs"   ) . readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;