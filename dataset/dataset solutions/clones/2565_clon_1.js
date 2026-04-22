/*
 *  This section handles the input/output setup for the JavaScript program.
 *  It uses the 'readline' module to read input line by line from standard input
 *  and processes it upon completion.
 */
var     read    =   require('readline') . createInterface(
    {
        input   :   process . stdin,
        output  :   process . stdout
    }
);

// Global variables to store parsed input and the input line array.
var     obj     ;
var     inLine  =   [ ] ;


read . on(
    'line' ,
    function    (   input   )
    {
        // Each line read from stdin is pushed into the 'inLine' array.
        inLine . push ( input ) ;
    }
);


read . on(
    'close' ,
    function    (           )
    {
        // Initialize the input object 'obj' once all lines have been read.
        obj     =   init ( inLine ) ;

        // Output a newline to stderr for visual separation before debug info.
        console . error ( "\n" ) ;


        // Record the starting time for performance measurement.
        var     start   =   Date . now ( ) ;

        // Execute the main logic of the program.
        Main ( ) ;

        // Calculate the elapsed time.
        var     end     =   Date . now ( )  -  start ;

        // Log the execution time to stderr.
        myerr ( "time : " + end + "ms" ) ;

        // Log the memory usage to stderr, specifically heapTotal in KB.
        myerr ( "memory : " + Math . round ( process . memoryUsage ( ) . heapTotal  /  1024 ) + "KB" ) ;
    }
) ;


/*
 *  Creates a deep clone of an object using JSON serialization/deserialization.
 *  This is a common, albeit sometimes inefficient, way to deep clone in JavaScript.
 */
function    makeClone   (   obj )
{
    return  JSON . parse ( JSON . stringify ( obj ) ) ;
}


/*
 *  Utility functions for reading different types of input from the processed lines.
 *  These functions delegate to `myconv` for type conversion.
 */
function    nextInt         ( ) { return    myconv ( next ( ) , 1 ) ; }
function    nextStrArray    ( ) { return    myconv ( next ( ) , 2 ) ; }
function    nextIntArray    ( ) { return    myconv ( next ( ) , 4 ) ; }
function    nextCharArray   ( ) { return    myconv ( next ( ) , 6 ) ; }


/*
 *  Retrieves the next item from the input stream.
 *  This function accesses the `next` method of the global `obj` input handler.
 */
function    next            ( ) { return    obj . next ( ) ; }

/*
 *  Checks if there are more items available in the input stream.
 *  This function accesses the `hasNext` method of the global `obj` input handler.
 */
function    hasNext         ( ) { return    obj . hasNext ( ) ; }


/*
 *  Initializes the input handler object.
 *  This object provides methods to sequentially access the input lines.
 */
function    init    (   input   )
{
    return  {
        // 'list' stores all the input lines.
        list    :   input   ,

        // 'index' tracks the current position in the input list.
        index   :   0       ,

        // 'max' stores the total number of input lines.
        max     :   input . length  ,

        /*
         *  Checks if there are more elements to read.
         *  Returns true if the current index is less than the total number of lines.
         */
        hasNext :   function    (       )
        {
            return  (   this . index    <   this . max  )   ;
        }   ,

        /*
         *  Retrieves the next input line.
         *  Increments the index after returning the current line.
         *  Throws an error if no more input is available.
         */
        next    :   function    (       )
        {
            if  (   this . hasNext ( )  )
            {
                return  this . list [   this . index ++ ]   ;
            }
            else
            {
                throw   "ArrayIndexOutOfBoundsException ‚There is no more input"    ;
            }
        }
    }   ;
}


/*
 *  Outputs a string to standard output, followed by a newline.
 *  This is a wrapper around console.log.
 */
function    myout   (   s   )
{
    console . log ( s ) ;
}


/*
 *  Outputs debug information to standard error.
 *  It uses Node.js's 'util.inspect' to provide a detailed string representation of the input 's'.
 */
function    myerr   (   s   )
{
    console . error (   "debug:"    +   require("util") . inspect ( s , false , null ) ) ;
}


/*
 *  This function converts input 'i' based on the specified 'no' parameter.
 *  The 'no' parameter acts as a type or format indicator for conversion.
 *
 *  Parameter 'no' values and their meanings:
 *  - unknown or outlier : returns 'i' as is.
 *  - 1: Parses 'i' as an integer (e.g., "123" -> 123).
 *  - 2: Splits 'i' by spaces into an array of strings (e.g., "a b c" -> ["a", "b", "c"]).
 *  - 4: Splits 'i' by spaces and converts each part to a number (e.g., "1 2 3" -> [1, 2, 3]).
 *  - 6: Splits 'i' into an array of single characters (e.g., "abc" -> ["a", "b", "c"]).
 *  - 7: Splits 'i' into characters and converts each to a number (e.g., "123" -> [1, 2, 3]).
 *  - 8: Joins elements of 'i' with spaces (e.g., ["a", "b"] -> "a b").
 *  - 9: Joins elements of 'i' with newlines (e.g., ["a", "b"] -> "a\nb").
 *  - 0: Joins elements of 'i' with no separator (e.g., ["a", "b"] -> "ab").
 */
function    myconv  (   i   ,   no  )
{
    try
    {
        switch  (   no  )
        {
            case    1   :   return  parseInt ( i )                      ;
            case    2   :   return  i . split ( " " )                   ;
            case    4   :   return  i . split ( " " ) . map ( Number )  ;
            case    6   :   return  i . split ( "" )                    ;
            case    7   :   return  i . split ( "" ) . map ( Number )   ;
            case    8   :   return  i . join ( " " )                    ;
            case    9   :   return  i . join ( "\n" )                   ;
            case    0   :   return  i . join ( "" )                     ;
            default     :   return  i                                   ;
        }
    }
    catch   (   e   )
    {
        // If an error occurs during conversion, return the original input.
        return  i   ;
    }
}


/*
 *  This marks the end of the auxiliary functions and setup.
 *  The primary logic of the program begins below.
 */

// This is the main function where the core algorithm resides.
function    Main    (           )
{
    // Read an integer N, though it's not used in the current algorithm for Z-algorithm.
    var     N       =   nextInt ( ) ;

    // Read a character array (string) 's' from input.
    var     s       =   nextCharArray ( ) ;

    // Initialize 'output' to store the maximum Z-value found.
    var     output  =   0           ;


    // Loop continues as long as the string 's' has characters.
    while   (   s . length  >   0   )
    {
        // Initialize the Z-array for the current string 's'.
        var     z       =   new Array ( s . length )    ;

        // The first element of the Z-array is always the length of the string itself.
        z [ 0 ]     =   s . length  ;

        // Initialize pointers for the Z-algorithm.
        var     i       =   1   ;
        var     j       =   0   ;

        // Iterate through the string to compute Z-values.
        while   (   i   <   s . length  )
        {
            // Expand the match from position 'i' as far as possible.
            while   (   (   i   +   j   )   <   s . length
                    &&  (   s [ j ]     ==  s [   i   +   j   ]   )
                    )
            {
                j ++    ;
            }

            // Store the length of the match in z[i].
            z [ i ]     =   j   ;

            // If no match was found, simply move to the next position.
            if  (   j   ==  0   )
            {
                i ++    ;
                continue    ;
            }

            // Use previously computed Z-values to speed up future calculations.
            var     k       =   1   ;
            while   (   (   i   +   k   )   <   s . length
                    &&  (   k   +   z [ k ]   <   j   )
                    )
            {
                z [   i   +   k   ]     =   z [ k ] ;
                k ++    ;
            }

            // Update 'i' and 'j' based on the skipped range.
            i   +=  k   ;
            j   -=  k   ;
        }

        // After computing the Z-array, find the maximum relevant Z-value.
        // Iterate from the end of the Z-array backwards.
        for (   var     m   =   s . length  -   1   ;
                m   >=  1               ;
                m --
            )
        {
            // If z[m] is less than or equal to half the string length,
            // it's a potential candidate for the 'output'.
            if  (   z [ m ]     <=  s . length  /   2   )
            {
                output  =   Math . max ( output , z [ m ] ) ;
            }
        }

        // Uncomment the line below to see the Z-array for debugging purposes.
        // myerr ( z ) ;

        // Remove the first character of the string 's' for the next iteration.
        // This effectively processes suffixes of the original string.
        s . shift ( ) ;
    }

    // Output the final calculated maximum value.
    myout ( output ) ;
}