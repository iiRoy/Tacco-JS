// This section contains boilerplate code for input/output handling.
// It's generally not relevant for the core logic of the problem.
// --- START OF UTILITY CODE ---

/* This is a comment block explaining the purpose of the 'read' variable. */
var read = require( 'readline' ).createInterface( {
    input   : process.stdin, /* Standard input stream. */
    output  : process.stdout // Standard output stream.
} );


// Declare a global object to hold the input parser.
var obj;

// Array to store all lines read from input.
var inLine = [ ];

read.on( 'line', function ( input ) { inLine.push( input ); } ); // Event listener for each line of input.

/*
 * This handler is executed when the input stream is closed.
 * It initializes the input object and then runs the main logic.
 */
read.on( 'close', function ( ) {

    obj = init( inLine ); // Initialize the input object with all collected lines.

    console.error( "\n" ); // Print a newline to stderr for visual separation.

    var start = Date.now( ); // Record the start time for performance measurement.

    Main( ); // Execute the primary function containing the problem's solution.

    var end = Date.now( ) - start; // Calculate the elapsed time.

    myerr( "time : " + ( end ) + "ms" ); // Output execution time to stderr.

    myerr( "memory : " + Math.round( process.memoryUsage( ).heapTotal / 1024 ) + "KB" ); // Output memory usage.
} );

// Creates a deep clone of an object using JSON serialization.
function makeClone ( obj ) { return JSON.parse( JSON.stringify( obj ) ); }


// Retrieves the next input token and converts it to an integer.
function nextInt ( ) { return myconv( next( ) , 1 ); }

// Retrieves the next input token and converts it to a string array (split by space).
function nextStrArray ( ) { return myconv( next( ) , 2 ); }

// Retrieves the next input token and converts it to an integer array (split by space).
function nextIntArray ( ) { return myconv( next( ) , 4 ); }

// Retrieves the next input token and converts it to a character array.
function nextCharArray ( ) { return myconv( next( ) , 6 ); }


// Retrieves the next raw input token from the initialized input object.
function next ( ) { return obj.next( ); }

// Checks if there are more input tokens available.
function hasNext ( ) { return obj.hasNext( ); }

// Initializes an object responsible for managing input tokens.
function init ( input ) {

    var returnObj = {

        list    : input, // The array containing all input lines.
        index   : 0, // Current index for reading input lines.
        max     : input.length, // Total number of input lines.

        // Method to check if there are more input lines to read.
        hasNext : function ( ) { return ( this.index < this.max ); },

        // Method to retrieve the next input line.
        next    : function ( ) {
            if ( ! this.hasNext( ) ) {
                throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error if no more input.
            } else {
                var returnInput = this.list[ this.index ]; // Get the current line.
                this.index++; // Advance the index.
                return returnInput; // Return the line.
            }
        }
    };

    return returnObj; // Return the initialized input manager object.
}

// Outputs a string to the standard output.
function myout ( s ) { console.log( s ); }

// Outputs a debug message to the standard error, inspecting objects for better readability.
function myerr ( s ) { console.error( "debug:" + require( "util" ).inspect( s , false , null ) ); }

/*
 * This function provides various conversion utilities for input data.
 * The 'no' parameter specifies the type of conversion to perform.
 *
 * Conversion Modes:
 *   - Undefined/Abnormal 'no': Returns the input 'i' as is.
 *   - 1: Converts 'i' to an integer using parseInt.
 *   - 2: Splits 'i' by single spaces into a string array.
 *   - 4: Splits 'i' by single spaces and converts each part to a Number, returning an array of numbers.
 *   - 6: Splits 'i' into a character array (each character becomes an element).
 *   - 7: Splits 'i' into a character array and converts each character to a Number, returning an array of numbers.
 *   - 8: Joins array 'i' elements with a single space.
 *   - 9: Joins array 'i' elements with a newline character.
 *   - 0: Joins array 'i' elements without any separator.
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1 :
                return parseInt( i ); // Convert to integer.

            case 2 :
                return i.split( " " ); // Split by space into string array.

            case 4 :
                return i.split( " " ).map( Number ); // Split by space, then map to numbers.

            case 6 :
                return i.split( "" ); // Split into character array.

            case 7 :
                return i.split( "" ).map( Number ); // Split into character array, then map to numbers.

            case 8 :
                return i.join( " " ); // Join array elements with spaces.

            case 9 :
                return i.join( "\n" ); // Join array elements with newlines.

            case 0 :
                return i.join( "" ); // Join array elements without separator.

            default :
                return i; // Default case: return input as is.
        }
    }
    catch ( e ) {
        return i; // In case of any error during conversion, return the original input.
    }
}

// --- END OF UTILITY CODE ---
// The following section contains the main logic for the problem.

/*
 * This is the main function where the problem's core logic resides.
 * It processes the input and produces the required output.
 */
function Main ( ) {

	// Read the first line of input as an array of integers.
	var one = nextIntArray( );

	// Extract values for M and K from the input array.
	var M = one[ 0 ];
	var K = one[ 1 ];

	// Check the condition for K.
	if ( K == 0 ) {

		// If K is 0, proceed with generating the sequence.
		// Allocate an array of size 2^(M+1).
		var output = new Array( Math.pow( 2 , M + 1 ) );

		// Loop to populate the output array.
		for ( var i = 0 ; i < Math.pow( 2 , M ) ; i++ ) {

			// Assign the current value 'i' at two consecutive positions.
			output[ i * 2 ] = i;
			output[ i * 2 + 1 ] = i;
		}

		// Convert the output array to a space-separated string and print it.
		myout( myconv( output , 8 ) );

	} else {

		// If K is not 0, output -1 as per problem requirements.
		myout( -1 );

	}
}