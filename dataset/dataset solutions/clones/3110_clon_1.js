var obj = init ( ) ;
Main ( ) ;

// Function to read the next integer from the input.
function nextInt ( ) {
    return myconv ( next ( ) , 1 ) ;
}


/**
 * @function nextStrArray
 * @description Reads the next line and splits it by half-width spaces.
 */
function nextStrArray ( ) {
    return myconv ( next ( ) , 2 ) ;
}


function nextIntArray ( )
{
    // Reads the next line, splits by spaces, and converts to an array of numbers.
    return myconv ( next ( ) , 4 ) ;
}


function nextCharArray ( ) {
    return myconv ( next ( ) , 6 ) ; // Splits the next input into an array of characters.
}


function next ( ) {
    return obj . next ( ) ;
}


function hasNext ( ) {
    return obj . hasNext ( ) ; // Checks if there are more input lines available.
}


function myin ( )
{
    /*
     * This utility function reads the entire standard input.
     * It then trims any leading/trailing whitespace and splits the content
     * into an array of strings, where each string represents a line.
     */
    return require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;
}


function init ( )
{
    var inputFile = myin ( ) ; // Obtain the raw input lines.

    var returnObj = {
        "list" : inputFile , // The array of input lines.
        "index" : 0 ,        // Current position in the input list.
        "max" : inputFile . length , // Total number of input lines.

        "hasNext" : function ( ) {
            return ( this . index < this . max ) ; // Check if more lines exist.
        } ,

        "next" : function ( ) {
            if ( ! this . hasNext ( ) ) {
                return "" ; // Return empty string if no more input.
            } else {
                var returnInput = this . list [ this . index ] ; // Get current line.
                this . index ++ ; // Advance the index.
                return returnInput ; // Return the line.
            }
        }
    } ;

    return returnObj ; // Return the initialized object for input handling.
}


function myout ( t ) {
    console . log ( t ) ; // Outputs the given value to the standard output stream.
}


function myerr ( t )
{
    console . error ( t ) ; // Outputs the given value to the standard error stream.
}

/*
 * myconv function: A versatile conversion utility for various data types.
 *
 * @param {any} i - The input data to be converted.
 * @param {number} no - The conversion type indicator.
 *
 * Conversion Type (no) Descriptions:
 *   1: Converts the input 'i' to an integer using parseInt().
 *   2: Splits the input string 'i' by half-width spaces (" ") into an array of strings.
 *   4: Splits the input string 'i' by half-width spaces (" ") and then maps each part to a Number.
 *   6: Splits the input string 'i' into an array of individual characters ("").
 *   7: Splits the input string 'i' into individual characters and then maps each character to a Number.
 *   8: Joins the elements of an array 'i' with half-width spaces (" ").
 *   9: Joins the elements of an array 'i' with newline characters ("\n").
 *   0: Joins the elements of an array 'i' without any separator ("").
 *   Default: If 'no' does not match any defined case, or in case of an error,
 *            the original input 'i' is returned unchanged.
 */
function myconv ( i , no )
{
    try {
        switch ( no )
        {
            case 1 :
                return parseInt ( i ) ;
            case 2 :
                return i . split ( " " ) ;
            case 4 :
                return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
            case 6 :
                return i . split ( "" ) ;
            case 7 :
                return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
            case 8 :
                return i . join ( " " ) ;
            case 9 :
                return i . join ( "\n" ) ;
            case 0 :
                return i . join ( "" ) ;
            default :
                return i ;
        }
    }
    catch ( e )
    {
        // If any error occurs during conversion, the original input is returned.
        return i ;
    }
}


function Main ( )
{
    var N = nextInt ( ) ; // Read the number of elements from input.

    var list = nextIntArray ( ) ; // Read the array of integers from input.

    // Perform an initial validation check on the input list.
    // Each element at index 'i' in 'list' must not be greater than 'i + 1'.
    for ( var i = 0 ; i < N ; i ++ )
    {
        if ( list [ i ] > ( i + 1 ) )
        {
            // If the condition is violated, output -1 and exit.
            myout ( -1 ) ;
            return ;
        }
    }

    var output = [ ] ; // Initialize an empty array to store the resulting sequence.
    var count = 0 ;    // Initialize a counter to traverse the 'list'.

    // Continue processing the 'list' until it becomes empty.
    while ( list . length > 0 )
    {
        // Check if the current element at 'count' matches its expected value (count + 1).
        if ( list [ count ] == count + 1 )
        {
            count ++ ; // If it matches, simply increment the counter.
        }
        else
        {
            // If there's a mismatch, it means the element at 'count - 1' is the one to be moved.
            output . unshift ( list [ count - 1 ] ) ; // Add it to the front of the 'output' array.
            list . splice ( count - 1 , 1 ) ;          // Remove this element from the 'list'.
            // myerr ( list . length + " " + count ) ; // This line was used for debugging purposes.
            count = 0 ; // Reset the counter to 0 to restart the check from the beginning of the modified 'list'.
        }
    }

    // Convert the final 'output' array into a newline-separated string and print it.
    myout ( myconv ( output , 9 ) ) ;
}