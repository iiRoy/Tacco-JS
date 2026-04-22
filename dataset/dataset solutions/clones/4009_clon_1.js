/*
 * This file contains utility functions for input/output operations
 * and a main logic function to solve a specific problem.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered for Type I cloning.
 */


    var obj = init(); // Initialize the input utility object.


Main(); /* Execute the main program logic after initialization. */



function nextInt( )
{
    // Converts the next input token to an integer.
    return myconv ( next ( ) , 1 ) ;
}


function nextStrArray ( )
{
    // Retrieves the next line and splits it by half-width spaces.
    return myconv ( next ( ) , 2 ) ; /* Split by space character */
}


function nextIntArray ( )
{
    // Retrieves the next line, splits by half-width spaces, and converts to numbers.
    return myconv ( next ( ) , 4 ) ; // Split by space and convert to numeric array.
}


function nextCharArray ( )
{
    // Retrieves the next line and splits it into individual characters.
    return myconv ( next ( ) , 6 ) ; /* Split into an array of single characters. */
}


function next ( )
{
    // Fetches the next available input token from the initialized object.
    return obj . next ( ) ;
}


function hasNext ( )
{
    // Checks if there are more input tokens available.
    return obj . hasNext ( ) ;
}


/*
 * Reads the entire standard input,
 * trims whitespace, and splits it into an array of lines.
 * This function uses Node.js 'fs' module for file system operations.
 */
function myin ( )
{
    return require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;
}


function init ( )
{
    // Initializes the input parsing utility.
    var inputFile = myin ( ) ;

    var returnObj = {
        "list" : inputFile ,
        "index" : 0 ,
        "max" : inputFile . length ,

        "hasNext" : function ( )
        {
            // Checks if there are more elements to read in the input list.
            return ( this . index < this . max ) ;
        } ,

        "next" : function ( )
        {
            if ( ! this . hasNext ( ) )
            {
                // Throws an error if no more input is available.
                throw "ArrayIndexOutOfBoundsException これ以上ないよ" ;
            }
            else
            {
                /* Retrieve the current input line */
                var returnInput = this . list [ this . index ] ;
                this . index ++ ; // Increment the index for the next read.
                return returnInput ;
            }
        }
    } ;

    return returnObj ;
}


function myout ( t )
{
    // Outputs the given argument to the standard output.
    console . log ( t ) ; // Standard output function.
}


function myerr ( t )
{
    // Outputs the given argument to the standard error stream.
    console . error ( t ) ; /* Standard error output. */
}


/*
 * This multi-purpose conversion function handles various data transformations.
 * Parameter 'no' dictates the type of conversion.
 *
 * Conversion Modes for 'no':
 *   - 1: Convert input 'i' to an integer (using parseInt).
 *   - 2: Split input 'i' by half-width spaces into an array.
 *   - 4: Split input 'i' by half-width spaces and convert each part to a number.
 *   - 6: Split input 'i' into an array of single characters.
 *   - 7: Split input 'i' into an array of single characters and convert each to a number.
 *   - 8: Join array 'i' elements with half-width spaces.
 *   - 9: Join array 'i' elements with newline characters.
 *   - 0: Join array 'i' elements without any separator.
 *   - Default: If 'no' is unknown or an error occurs, return 'i' unchanged.
 */
function myconv ( i , no )
{
    try
    {
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
        // In case of any conversion error, return the original input.
        return i ;
    }
}


function Main ( )
{
    /* Read the first line as an integer, though it's not directly used in this MARCH problem logic. */
    var N = nextInt ( ) ;


    /* Initialize a hash map (object) to count occurrences of MARCH letters. */
    var list = {
        "M" : 0 ,
        "A" : 0 ,
        "R" : 0 ,
        "C" : 0 ,
        "H" : 0
    } ;


    /* Iterate through the remaining input lines. */
    while ( hasNext ( ) )
    {
        /* Get the first character of each line. */
        var first = nextCharArray ( ) [ 0 ] ;

        /* Increment the counter for the respective character if it's one of 'M', 'A', 'R', 'C', 'H'. */
        list [ first ] ++ ;
    }


    /* Get the keys (M, A, R, C, H) from the list object. */
    var keys = Object . keys ( list ) ;

    /* Initialize the output variable for counting combinations. */
    var output = 0 ;


    /*
     * Iterate through all unique combinations of three distinct letters from 'M', 'A', 'R', 'C', 'H'.
     * This uses three nested loops to select three different indices (i, j, k)
     * such that i < j < k, ensuring unique combinations.
     */
    for ( var i = 0 ; i < keys . length - 2 ; i ++ )
    {
        for ( var j = i + 1 ; j < keys . length - 1 ; j ++ )
        {
            for ( var k = j + 1 ; k < keys . length ; k ++ )
            {
                /*
                 * Multiply the counts of the selected three letters
                 * and add the product to the total output.
                 * This calculates the number of ways to pick one name starting with keys[i],
                 * one name starting with keys[j], and one name starting with keys[k].
                 */
                output += list [ keys [ i ] ] * list [ keys [ j ] ] * list [ keys [ k ] ] ;
            }
        }
    }

    /* Output the final calculated total number of combinations. */
    myout ( output ) ;
}