/*
 * This file contains a set of utility functions
 * for input/output operations and data type conversions,
 * along with the main logic for a specific problem.
 */


function myin ( ) {
    // Reads input from standard input (/dev/stdin)
    // and returns it as a trimmed string.
    return require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ;
}


function myout ( t )
{
    /*
     * Outputs the given argument 't' to the console.
     * This serves as the standard output function.
     */
    console . log ( t ) ;
}


/**
 * myconv: A versatile conversion utility function.
 * It takes an input 'i' and a conversion 'no' number
 * to perform various transformations.
 *
 * @param {string|Array} i - The input data to be converted.
 * @param {number} no - The conversion type identifier.
 *                       0: No conversion, returns input as is.
 *                       1: Converts input to an integer.
 *                       2: Splits input string by space into an array.
 *                       3: Splits input string by newline into an array.
 *                       4: Splits by space and converts elements to numbers.
 *                       5: Splits by newline and converts elements to numbers.
 *                       6: Splits string into an array of single characters.
 *                       7: Splits string to chars and converts them to numbers.
 * @returns {*} The converted value based on 'no'.
 */
function myconv( i , no ) {

    switch ( no ) {

        case 0 : // Case 0: No operation, return original input
            return i ;

        case 1 : // Case 1: Parse input as an integer
            return parseInt ( i ) ;

        case 2 : // Case 2: Split string by space character
            return i . split ( " " ) ;

        case 3 : // Case 3: Split string by newline character
            return i . split ( "\n" ) ;

        case 4 : // Case 4: Split by space, then map to Number
            return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;

        case 5 : // Case 5: Split by newline, then map to Number
            return i . split ( "\n" ) . map ( ( a ) => Number ( a ) ) ;

        case 6 : // Case 6: Split string into individual characters
            return i . split ( "" ) ;

        case 7 : // Case 7: Split string to characters, then map to Number
            return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
    }
}


function Main ( input ) {
    // Process the raw input string
    input = myconv ( input , 3 ) ; // Convert input into an array of lines

    // Extract H, W, and N from the processed input lines
    var H = myconv ( input [ 0 ] , 4 ) [ 0 ] ; // Height (first element of first line, converted to number)
    var W = myconv ( input [ 0 ] , 4 ) [ 1 ] ; // Width (second element of first line, converted to number)
    var N = myconv ( input [ 1 ] , 1 ) ; // Number of blocks (second line, converted to integer)
    var list = myconv ( input [ 2 ] , 4 ) ; // List of block counts (third line, split by space, converted to numbers)


    // Initialize a 2D array (matrix) for the output grid
    var output = new Array ( H ) ;
    for ( var i = 0 ; i < H ; i ++ ) {
        output [ i ] = new Array ( W ) ;
    }


    // Variable to track the current block number being placed
    var getNo = 1 ;

    // Iterate through each row of the grid
    for ( var i = 0 ; i < H ; i ++ ) {
        // Check if the current row index is even or odd
        if ( i % 2 == 0 ) {
            // For even rows, fill from left to right (j from 0 to W-1)
            for ( var j = 0 ; j < W ; j ++ ) {
                // If the current block type (getNo) has run out (count is 0)
                if ( list [ getNo - 1 ] == 0 ) {
                    getNo ++ ; // Move to the next block type
                }
                list [ getNo - 1 ] -- ; // Decrement count of the current block type
                output [ i ] [ j ] = getNo ; // Place the current block number in the grid
            }
        } else {
            // For odd rows, fill from right to left (j from W-1 down to 0)
            for ( var j = W - 1 ; j >= 0 ; j -- ) {
                // If the current block type (getNo) has run out
                if ( list [ getNo - 1 ] == 0 ) {
                    getNo ++ ; // Move to the next block type
                }
                list [ getNo - 1 ] -- ; // Decrement count of the current block type
                output [ i ] [ j ] = getNo ; // Place the current block number
            }
        }
    }

    // After filling the grid, convert each row array into a space-separated string
    for ( var i = 0 ; i < H ; i ++ ) {
        output [ i ] = output [ i ] . join ( " " ) ;
    }

    // Finally, join all row strings with newline characters and output the result
    myout ( output . join ( "\n" ) ) ;
}


// Entry point: Read input and pass it to the Main function
Main ( myin ( ) ) ;