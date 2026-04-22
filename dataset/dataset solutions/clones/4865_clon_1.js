var input= require("fs") . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ; /*
 *  This section initializes the input data.
 *  It reads from standard input, trims whitespace, and splits by newlines.
 */

var obj =
{
    "list"  :  input , // The array containing input lines
    "index" :  0     , // Current position in the list
    "max"   :  input.length , // Total number of elements in the list

    // Function to get the next element from the list
    "next"  :  function ( )
    {
        // Check if there are more elements
        if ( ! this . hasNext ( ) )
        {
            throw "NoSuchElementException:次に要素は無いよ" ; // Throw error if no more elements
        }

        var returnObj = this . list [ this . index ] ; // Get the current element
        this . index ++ ; // Increment the index for the next call

        return returnObj ; // Return the fetched object
    },

    // Function to check if there are more elements
    "hasNext" : function ( ) { return ( this . index < this . max ) ; }
} ;

// Execute the main program logic
Main ( ) ;

/**
 * Global helper function to retrieve the next item from the input.
 * Delegates to the 'obj' reader's next method.
 * @returns {string} The next line from input.
 */
function next ( ) { return obj . next ( ) ; }

/**
 * Global helper function to check if more input is available.
 * Delegates to the 'obj' reader's hasNext method.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext ( ) { return obj . hasNext ( ) ; }

/*
 * myout: Standard output function.
 * Prints the given argument 't' to the console.
 */
function myout ( t ) { console . log ( t ) ; }

/*
 * myerr: Standard error output function.
 * Prints the given argument 't' to the error console.
 */
function myerr ( t ) { console . error ( t ) ; }

/*
 * myconv function:
 * Handles various conversions and manipulations of input data based on 'no' parameter.
 * Default: Returns input 'i' as is.
 * 1: Converts 'i' to an integer.
 * 2: Splits 'i' by space.
 * 4: Splits 'i' by space and converts each part to a number.
 * 6: Splits 'i' into an array of single characters.
 * 7: Splits 'i' into an array of single characters and converts each to a number.
 * 8: Joins array 'i' with spaces.
 * 9: Joins array 'i' with newlines.
 * 0: Joins array 'i' with no separator.
 * Error handling: If any conversion fails, returns 'i' unchanged.
 */
function myconv ( i , no )
{
    try
    {
        switch ( no )
        {
            case 1 : return parseInt ( i ) ;
            case 2 : return i . split ( " " ) ;
            case 4 : return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
            case 6 : return i . split ( "" ) ;
            case 7 : return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
            case 8 : return i . join ( " " ) ;
            case 9 : return i . join ( "\n" ) ;
            case 0 : return i . join ( "" ) ;
            default : return i ;
        }
    }
    catch ( e )
    {
        return i ;
    }
}

// The main function where the program logic resides.
function Main ( )
{
    var one = myconv ( next ( ) , 4 ) ; // Read the first line and convert to array of numbers
    var H = one [ 0 ] ; // Get height
    var W = one [ 1 ] ; // Get width

    var list = new Array ( H ) ; // Initialize a 2D array (list of rows)

    // Populate the list with character arrays for each row
    for ( var i = 0 ; i < H ; i ++ )
    {
        list [ i ] = myconv ( next ( ) , 6 ) ; // Read next line and split into characters
    }

    var count = 0 ; // Initialize counter for '#' characters

    // Iterate through the grid to count '#' characters
    for ( var i = 0 ; i < H ; i ++ )
    {
        for ( var j = 0 ; j < W ; j ++ )
        {
            if ( list [ i ] [ j ] == "#" )
            {
                 count ++ ; // Increment count if '#' is found
            }
        }
    }

    // Check the condition and output result
    if ( count == H + W - 1 )
    {
         myout ( "Possible" ) ; // Output "Possible"
    }
    else
    {
         myout ( "Impossible" ) ; // Output "Impossible"
    }
}