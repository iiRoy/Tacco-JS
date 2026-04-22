/*
 * This section is dedicated to input/output handling and utility functions.
 * It's typically used as a boilerplate for competitive programming environments.
 */
var   read   =   require ( 'readline' ) . createInterface ( {
    input   :   process . stdin , // Standard input stream.
    output   :   process . stdout // Standard output stream.
} ) ;

var   obj ; // Object to manage input parsing.
var   inLine   =   [ ] ; // Array to accumulate all input lines.

/*
 * Event handler for each line received from standard input.
 * Each line is pushed into the 'inLine' array.
 */
read . on ( 'line' ,   function ( input ) {
    inLine . push ( input ) ;
} ) ;

/*
 * Event handler triggered when the input stream ends (e.g., EOF).
 * Initializes the input parser 'obj' and then calls the main program logic.
 */
read . on ( 'close' ,   function ( ) {
    obj   =   init ( inLine ) ; // Initialize the custom input object.
    console . error ( '\n↑入力 ↓出力' ) ; // Debug message indicating I/O direction.
    Main ( ) ; // Execute the primary function of the program.
} ) ;

/**
 * Creates a deep clone of an object.
 * Handles Set objects specifically; otherwise, uses JSON serialization/deserialization.
 * @param {any} obj - The object to clone.
 * @returns {any} A deep copy of the input object.
 */
function   makeClone ( obj )
{
    return   ( obj   instanceof   Set )
        ?   new   Set ( Array . from ( obj ) ) // Clone Set by converting to Array and back.
        :   JSON . parse ( JSON . stringify ( obj ) ) ; // Generic deep clone using JSON.
}

/**
 * Reads the next input line and converts it to an integer.
 * @returns {number} The parsed integer.
 */
function   nextInt ( ) {
    return   myconv ( next ( ) ,   1 ) ;
}

/**
 * Reads the next input line and splits it into an array of strings (space-separated).
 * @returns {string[]} An array of strings.
 */
function   nextStrArray ( ) {
    return   myconv ( next ( ) ,   2 ) ;
}

/**
 * Reads the next input line, splits it by spaces, and converts each part to a number.
 * @returns {number[]} An array of numbers.
 */
function   nextIntArray ( ) {
    return   myconv ( next ( ) ,   4 ) ;
}

/**
 * Reads the next input line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function   nextCharArray ( ) {
    return   myconv ( next ( ) ,   6 ) ;
}

/**
 * Retrieves the next raw input line from the buffered input.
 * @returns {string} The next input line.
 */
function   next ( ) {
    return   obj . next ( ) ;
}

/**
 * Checks if there are more input lines available to read.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function   hasNext ( ) {
    return   obj . hasNext ( ) ;
}

/**
 * Initializes an input reader object.
 * Provides methods to check for more input and retrieve the next line.
 * @param {string[]} input - An array of all input lines.
 * @returns {object} An object with input data and navigation methods.
 */
function   init ( input )
{
    return   {
        list   :   input , // The complete list of input lines.
        index   :   0 , // Current position in the 'list'.
        max   :   input . length , // Total number of lines in 'list'.

        /**
         * Determines if there are any remaining input lines.
         * @returns {boolean} True if 'index' is less than 'max', indicating more input.
         */
        hasNext   :   function ( )
        {
            return   ( this . index   <   this . max ) ;
        } ,

        /**
         * Retrieves the current line of input and advances the internal index.
         * Throws an error if no more input is available.
         * @returns {string} The next line from the input list.
         * @throws {string} 'ArrayIndexOutOfBoundsException' if attempting to read past the end.
         */
        next   :   function ( )
        {
            if   ( this . hasNext ( ) )
            {
                return   this . list [ this . index ++ ] ;
            }
            else
            {
                throw   'ArrayIndexOutOfBoundsException ‚There is no more input' ;
            }
        }
    } ;
}

/**
 * Prints the given value 's' to the standard output, followed by a newline.
 * This is typically used for the final answer.
 * @param {any} s - The value to print.
 */
function   myout ( s )
{
    console . log ( s ) ;
}

/**
 * Prints a debug message to the standard error stream.
 * Uses Node.js 'util.inspect' for detailed object inspection.
 * @param {any} s - The value to debug.
 */
function   myerr ( s )
{
    console . error ( 'debug:'   +   require ( 'util' ) . inspect ( s ,   false ,   null ) ) ;
}

/*
 * This function performs various conversions on input data 'i' based on 'no'.
 *
 * The 'no' parameter specifies the conversion type:
 *   - If 'no' is 1: Parses 'i' as an integer.
 *   - If 'no' is 2: Splits string 'i' by spaces into a string array.
 *   - If 'no' is 4: Splits string 'i' by spaces and converts parts to numbers (number array).
 *   - If 'no' is 6: Splits string 'i' into a character array.
 *   - If 'no' is 7: Splits string 'i' into a character array and converts parts to numbers.
 *   - If 'no' is 8: Joins array 'i' elements with spaces.
 *   - If 'no' is 9: Joins array 'i' elements with newlines.
 *   - If 'no' is 0: Joins array 'i' elements without any separator.
 *   - Default (any other 'no' or on error): Returns 'i' unchanged.
 *
 * @param {string|Array<any>} i - The input data to be converted.
 * @param {number} no - The conversion type identifier.
 * @returns {any} The converted data, or the original 'i' if conversion fails or 'no' is unknown.
 */
function   myconv ( i ,   no )
{
    try
    {
        switch   ( no )
        {
            case   1 :
                return   parseInt ( i ) ; // Convert to an integer.
            case   2 :
                return   i . split ( ' ' ) ; // Split by space into a string array.
            case   4 :
                return   i . split ( ' ' ) . map ( Number ) ; // Split by space, then map to numbers.
            case   6 :
                return   i . split ( '' ) ; // Split into an array of characters.
            case   7 :
                return   i . split ( '' ) . map ( Number ) ; // Split into characters, then map to numbers.
            case   8 :
                return   i . join ( ' ' ) ; // Join array elements with a space.
            case   9 :
                return   i . join ( '\n' ) ; // Join array elements with a newline.
            case   0 :
                return   i . join ( '' ) ; // Join array elements with no separator.
            default :
                return   i ; // Return as is for unknown 'no'.
        }
    }
    catch   ( e )
    {
        return   i ; // Return original 'i' if an error occurs during conversion.
    }
}

/*
 * This marks the end of the common utility functions.
 * The 'Main' function below contains the problem-specific logic.
 */

/**
 * The primary function containing the core logic of the program.
 * It reads problem-specific input, performs calculations, and outputs the result.
 */
function   Main ( )
{
    // Read the first line of input, which contains three integers: N, Z, and W.
    var   one   =   nextIntArray ( ) ;

    // Destructure the array 'one' into individual problem variables for clarity.
    var   N   =   one [ 0 ] ; // Represents the number of elements in the 'list'.
    var   Z   =   one [ 1 ] ; // Player Z's initial score or value.
    var   W   =   one [ 2 ] ; // Player W's initial score or value.

    // Read the second line of input, which is a list of integers.
    var   list   =   nextIntArray ( ) ;

    // Implement the conditional logic based on the value of N.
    if   ( N   ==   1 )
    {
        // If N is 1, the output is the absolute difference between the single list element and W.
        myout ( Math . abs ( list [ N   -   1 ]   -   W ) ) ;
    }
    else
    {
        // If N is greater than 1, calculate the maximum of two values:
        // 1. The absolute difference between the last two elements of the 'list'.
        // 2. The absolute difference between the last element of the 'list' and W.
        myout ( Math . max ( Math . abs ( list [ N   - 2 ]   -   list [ N   - 1 ] ) ,   Math . abs ( list [ N   - 1 ]   -   W ) ) ) ;
    }
}