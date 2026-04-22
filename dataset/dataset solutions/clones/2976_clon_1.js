/*
 * This file contains a custom input parser utility and a main function
 * demonstrating its usage.
 *
 * The `I` class (InputReader) is designed to read data, typically numbers,
 * from a multiline string input.
 *
 * Strict mode is enabled for better code quality.
 */
"use strict";


// Define the InputReader class (named 'I' for brevity as in original code).
// It takes a string 't' (input content) and an optional parser function 'i'.
function I( t, i )
{
    // Store the input string as an array of lines.
    this._s = t.split( "\n" );

    // Current column (token) index within the current line.
    this._c = 0;

    // Current line index.
    this._l = 0;

    // The function used to parse tokens; defaults to Number if not provided.
    this._f = i || Number;
}


// Define a prototype method 'a' (read one token) for the InputReader class.
// 't' here is an optional custom parser for this specific token.
I.prototype.a = function ( t )
{
    // Get the current line from the stored array of lines.
    var i = this._s[ this._l ];

    // Check if the current line actually exists.
    if ( i )
    {
        // Trim whitespace from the line and split it into tokens by space.
        var s = i.trim().split( " " );

        // Get the token at the current column index.
        var h = s[ this._c ];

        // Increment the column index for the next read.
        this._c++;

        // If all tokens on the current line have been read, reset column and advance to the next line.
        s.length === this._c && ( this._c = 0, this._l++ );

        // Parse and return the token using the provided custom parser 't' or the default parser '_f'.
        return t ? t( h ) : this._f( h );
    }
};


// Define a prototype method 'l' (read a whole line of tokens) for the InputReader class.
// 't' here is an optional custom parser for tokens on this line.
I.prototype.l = function ( t )
{
    // Get the current line.
    var i = this._s[ this._l ];

    // Check if the current line exists.
    if ( i )
    {
        // Reset column index as we're reading a full new line.
        this._c = 0;

        // Advance to the next line.
        this._l++;

        // Split the line into tokens and map them using the provided parser 't' or the default '_f'.
        return i.split( " " ).map( t || this._f );
    }
};


// Export the InputReader class for use in other modules.
module.exports = I;


// The main application logic function.
function main( input )
{
    // Create a new instance of the InputReader with the provided input string.
    var o = new I( input );

    // Read the first number from the input.
    var n = o.a();

    // Read the second number from the input.
    var k = o.a();

    // Calculate and print the result: (first_number - second_number + 1).
    console.log( n - k + 1 );
}


// Read input from stdin and pass it to the main function.
// This uses Node.js 'fs' module to read the file synchronously.
main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );