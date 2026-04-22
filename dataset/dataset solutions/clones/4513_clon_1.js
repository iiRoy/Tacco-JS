/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain precisely
 * the same. Only whitespace and comments have been altered
 * to achieve a visually distinct representation.
 */

// --- Start of Utility and Input Handling Section ---

    // Initialize the readline interface for standard input/output operations.
    var read = require( 'readline' ).createInterface(
        {
            input: process.stdin,
            output: process.stdout
        }
    );


    /*
     * Declare global variables for storing processed input and raw input lines.
     * 'obj' will hold the input stream object, 'inLine' will store raw lines.
     */
    var obj;
    var inLine = [ ];


    // Event listener for each line of input received from stdin.
    read.on(
        'line',
        function ( input ) {
            inLine.push( input ); // Add the received line to the 'inLine' array.
        }
    );


    // Event listener for when the input stream closes.
    // This is where the main processing flow typically begins.
    read.on(
        'close',
        function ( )
        {
            /*
             * Initialize the input object with all collected lines.
             * This object provides methods to consume input sequentially.
             */
            obj = init( inLine );

            // Output a debug message to stderr indicating input/output direction.
            console.error( '\n↑入力 ↓出力' );

            // Call the main program logic.
            Main( );
        }
    );


    // Function to create a deep clone of an object.
    // Handles Set objects specifically, otherwise uses JSON serialization for deep copy.
    function makeClone ( obj )
    {
        return ( obj instanceof Set )
               ? new Set( Array.from( obj ) )
               : JSON.parse( JSON.stringify( obj ) );
    }


    // Helper functions for parsing different types of input from the stream.
    function nextInt ( )
    {
        return myconv( next( ), 1 ); /* Converts the next input item to an integer. */
    }

    function nextStrArray ( )
    {
        return myconv( next( ), 2 ); /* Converts the next input item to an array of strings (split by space). */
    }


    function nextIntArray ( )
    {
        return myconv( next( ), 4 ); /* Converts the next input item to an array of integers (split by space). */
    }

    function nextCharArray ( )
    {
        return myconv( next( ), 6 ); /* Converts the next input item to an array of characters. */
    }


    // Retrieves the next raw input string from the input object.
    function next ( )
    {
        return obj.next( );
    }

    // Checks if there is more input available in the stream.
    function hasNext ( )
    {
        return obj.hasNext( );
    }


    // Initializes and returns an input stream object.
    // This object manages the list of input lines, current index, and provides methods
    // for checking availability and retrieving the next line.
    function init ( input )
    {
        return {
            list : input,         // The array containing all input lines.
            index : 0,            // The current position in the input array.
            max : input.length,   // The total number of input lines.

            // Method to check if there are more lines to read.
            hasNext : function ( )
            {
                return ( this.index < this.max );
            },

            // Method to retrieve the next line of input.
            // Throws an error if no more input is available.
            next : function ( )
            {
                if ( this.hasNext( ) )
                {
                    return this.list[ this.index++ ];
                }
                else
                {
                    throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
                }
            }
        };
    }


    // A simple wrapper for console.log to output results.
    function myout ( s )
    {
        console.log( s );
    }


    // A debug utility function to log objects to stderr with full inspection.
    function myerr ( s )
    {
        console.error( 'debug:' + require( 'util' ).inspect( s, false, null ) );
    }


    /*
     * The `myconv` function handles various input conversion scenarios.
     * The 'no' parameter determines the type of conversion to apply to 'i'.
     *
     * Parameter 'no' definitions:
     *   - unknown or outlier: Returns 'i' unchanged.
     *   - 1: Parses 'i' as an integer (parseInt).
     *   - 2: Splits 'i' by spaces into a string array.
     *   - 4: Splits 'i' by spaces and maps to numbers (integer array).
     *   - 6: Splits 'i' into individual characters.
     *   - 7: Splits 'i' into individual characters and maps to numbers (integer array).
     *   - 8: Joins elements of 'i' with a space.
     *   - 9: Joins elements of 'i' with a newline.
     *   - 0: Joins elements of 'i' without any separator.
     */
    function myconv ( i, no )
    {
        try
        {
            switch ( no )
            {
                case 1:
                    return parseInt( i ); // Convert to integer.
                case 2:
                    return i.split( ' ' ); // Split by space.
                case 4:
                    return i.split( ' ' ).map( Number ); // Split by space and convert to numbers.
                case 6:
                    return i.split( '' ); // Split into characters.
                case 7:
                    return i.split( '' ).map( Number ); // Split into characters and convert to numbers.
                case 8:
                    return i.join( ' ' ); // Join array elements with spaces.
                case 9:
                    return i.join( '\n' ); // Join array elements with newlines.
                case 0:
                    return i.join( '' ); // Join array elements without separator.
                default:
                    return i; // No specific conversion, return as is.
            }
        }
        catch ( e )
        {
            return i; // In case of conversion error, return original input.
        }
    }


// --- End of Utility and Input Handling Section ---


// --- Main Program Logic Starts Here ---
function Main ( )
{
    // Read the first line of input, expected to be two integers.
    var one = nextIntArray( );

    // Extract N and M from the parsed input array.
    var N = one[ 0 ];
    var M = one[ 1 ];

    // Define the modulo constant.
    var mod = 1000000007;

    // Initialize the output variable, which will store the final result.
    var output = 1;

    // Check the absolute difference between N and M.
    // If the difference is 2 or more, the result is 0.
    if ( Math.abs( N - M ) >= 2 )
    {
        myout( 0 ); // Output 0 and terminate.
    }
    else
    {
        // Calculate N! (N factorial) modulo 'mod'.
        for ( var i = 1; i <= N; i++ )
        {
            output *= i;    // Multiply output by current 'i'.
            output %= mod;  // Apply modulo operation.
        }

        // Calculate M! (M factorial) modulo 'mod' and multiply with the previous result.
        for ( var i = 1; i <= M; i++ )
        {
            output *= i;    // Multiply output by current 'i'.
            output %= mod;  // Apply modulo operation.
        }

        // If N and M are equal, multiply the current output by 2 (modulo 'mod').
        // This accounts for the two possible arrangements when N == M.
        if ( M == N )
        {
            output *= 2;
            output %= mod;
        }

        // Output the final calculated result.
        myout( output );
    }
}
// --- Main Program Logic Ends Here ---