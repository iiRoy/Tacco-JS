/*
 * This is a Type I code clone generated from an original JavaScript program.
 * All core functionalities, identifiers (variable names, function names),
 * operators, and expressions are preserved exactly as in the source.
 *
 * The only modifications made are to whitespace (indentation, spacing,
 * blank lines) and comments (addition, removal, and modification).
 * The objective is to present the code with a significantly different
 * visual layout while maintaining absolute logical and structural identity.
 */

// --- Program Entry Point ---
// The Main function is invoked immediately upon script execution.
// Its argument is obtained by calling the 'myin' function,
// which reads data from standard input.
Main (
    myin ()
) ;

// --- Function Definition: myin ---
// This function is responsible for reading content from standard input.
// It uses Node.js's 'fs' module to perform a synchronous file read.
function   myin   ( )
{
    // Reads the entire content of /dev/stdin as a UTF-8 string,
    // then removes leading/trailing whitespace.
    return   require ( "fs" )
        .   readFileSync ( "/dev/stdin" ,   "utf8" )
        .   trim ( ) ;
}


// --- Function Definition: myout ---
// This utility function handles standard output operations.
// It simply logs the provided argument 't' to the console.
function   myout   ( t )
{
    console . log ( t ) ;
}


// --- Function Definition: myerr ---
// This utility function handles standard error output operations.
// It logs the provided argument 't' to the console's error stream.
function   myerr   ( t )
{
    console . error ( t ) ;
}


// --- Conversion Parameter Reference for myconv function ---
// The 'no' parameter dictates the type of conversion to be applied:
//
//   - Default (any other value): Returns the input 'i' unchanged.
//   - 1: Converts 'i' to an integer.
//   - 2: Splits string 'i' by single spaces (" ").
//   - 3: Splits string 'i' by newline characters ("\n").
//   - 4: Splits string 'i' by spaces, then converts each part to a number.
//   - 5: Splits string 'i' by newlines, then converts each part to a number.
//   - 6: Splits string 'i' into an array of individual characters.
//   - 7: Splits string 'i' into characters, then converts each to a number.
//   - 8: Joins array 'i' elements with a single space (" ").
//   - 9: Joins array 'i' elements with a newline character ("\n").
//   - 0: Joins array 'i' elements without any separator (concatenation).
// --------------------------------------------------------
function   myconv   ( i ,   no )
{
    switch   ( no )
    {
        case   1   :
            return   parseInt ( i ) ;
        case   2   :
            return   i . split ( " " ) ;
        case   3   :
            return   i . split ( "\n" ) ;
        case   4   :
            return   i . split ( " " ) . map ( ( a ) =>   Number ( a ) ) ;
        case   5   :
            return   i . split ( "\n" ) . map ( ( a ) =>   Number ( a ) ) ;
        case   6   :
            return   i . split ( "" ) ;
        case   7   :
            return   i . split ( "" ) . map ( ( a ) =>   Number ( a ) ) ;
        case   8   :
            return   i . join ( " " ) ;
        case   9   :
            return   i . join ( "\n" ) ;
        case   0   :
            return   i . join ( "" ) ;
        default   :
            return   i ;
    }
}


// --- Main Program Logic ---
// This is the primary function that orchestrates the data processing.
// It takes the raw input string, converts it, performs a specific
// array manipulation, and then outputs the result.
function   Main   ( input )
{
    // Convert the initial input string into an array of numbers.
    // The '4' parameter indicates splitting by spaces and then mapping to numbers.
    input   =   myconv ( input ,   4 ) ;

    // Extract individual problem parameters from the processed input array.
    var   N   =   input [ 0 ] ; // The first element is assigned to N.
    var   K   =   input [ 1 ] ; // The second element is assigned to K.
    var   S   =   input [ 2 ] ; // The third element is assigned to S.

    // Initialize a new array named 'list' with a length of N.
    var   list   =   new   Array ( N ) ;

    // Iterate through the 'list' array from the first element up to N-1.
    for   ( var   i   =   0 ;   i   <   N ;   i ++ )
    {
        // Conditional assignment based on the current index 'i' relative to 'K'.
        if   ( i   <   K )
        {
            // If 'i' is less than 'K', assign the value of 'S' to the current element.
            list [ i ]   =   S ;
        }
        else
        {
            // Otherwise (if 'i' is greater than or equal to 'K'),
            // assign the numeric value 1 to the current element.
            list [ i ]   =   1 ;
        }
    }

    // Join the elements of the final 'list' array with spaces
    // and print the resulting string to standard output.
    myout ( list . join ( " " ) ) ;
}