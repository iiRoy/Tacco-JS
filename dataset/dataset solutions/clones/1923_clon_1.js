/*
 * This file defines a Scanner class for parsing input
 * and a Main function that uses the scanner to solve a specific problem.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

function Scanner( input ) {

    // Reference to the current instance of the Scanner object
    var self = this;

    // Initialize item number for tracking current position in parsed input
    self.itemNo = 0;

    // Store the original input string
    self.orgStr = input;

    /*
     * Immediately invoked function expression (IIFE) to
     * preprocess the input string and split it into an array of strings.
     * This handles variations in whitespace (newlines, tabs, spaces).
     */
    self.splitedStrs = ( function( target ) {

        var result = [ ]; // Array to hold the split string parts

        // Replace multiple whitespace characters (newlines, spaces, tabs) with a single space
        var target = target.replace( /[\n \t]+/g, " " );

        // Split the processed string by single spaces
        var strs = target.split( " " );

        // Iterate through the split parts and push them into the result array
        for ( var i = 0, len = strs.length; i < len; i++ ) {
            result.push( strs[ i ] );
        }

        return result; // Return the array of split strings

    }( input ) ); // Pass the original 'input' to the IIFE

    // Method to get the next string token from the input
    self.next = function() {

        var result = self.splitedStrs[ self.itemNo ]; // Get the current token
        self.itemNo++; // Increment the item number for the next call

        // Return the token if it's not null, otherwise return null
        return ( result != null ) ? result : null;

    }; // End of self.next function definition

    // Method to get the next integer token from the input
    self.nextInt = function() {

        var result = self.splitedStrs[ self.itemNo ]; // Retrieve the string token
        self.itemNo++; // Advance the item number

        // Parse the token as an integer if it's not null
        return ( result != null ) ? parseInt( result ) : null;

    }; // End of self.nextInt function definition

    // Method to get the next floating-point number token (BigDecimal equivalent)
    self.nextBigDecimal = function() {

        var result = self.splitedStrs[ self.itemNo ]; // Fetch the string token
        self.itemNo++; // Move to the next token

        // Parse the token as a float if it's not null
        return ( result != null ) ? parseFloat( result ) : null;

    }; // End of self.nextBigDecimal function definition

    // Method to get the next byte token (represented as Int8Array)
    self.nextByte = function() {

        var result = self.splitedStrs[ self.itemNo ]; // Get the string token
        self.itemNo++; // Increment position

        // Create a new Int8Array from the result if it's not null.
        // Note: This assumes 'result' can be directly used to construct Int8Array,
        // which might be an unusual interpretation for single byte parsing.
        return ( result != null ) ? new Int8Array( result ) : null;

    }; // End of self.nextByte function definition

} // End of Scanner class definition


/*
 * The main function where the problem logic resides.
 * It takes a Scanner instance as input to read values.
 */
function Main( sc ) {

    // Read problem parameters N, M, Q using the scanner
    var N = sc.nextInt();
    var M = sc.nextInt();
    var Q = sc.nextInt();

    // Array to store the 'abcd' objects (constraints/conditions)
    var abcds = [];

    // Variable to keep track of the maximum points achieved
    var point = 0;

    // Temporary variable for points in the current iteration
    var wkPoint = 0;

    // Loop to read Q sets of (a, b, c, d) values
    for ( var i = 0; i < Q; i++ ) {

        // Create an object to store the four integer values
        var abcd = {
            a: sc.nextInt(),
            b: sc.nextInt(),
            c: sc.nextInt(),
            d: sc.nextInt(),
        };

        // Add the created 'abcd' object to the array
        abcds.push( abcd );

    } // End of loop for reading abcds

    // Initialize an array 'array' of size N, filled with 1s.
    // This array represents a sequence A, where A_i can range from 1 to M.
    var array = [];
    for ( var i = 0; i < N; i++ ) {
        array.push( 1 );
    }

    // Main loop to iterate through all possible sequences A.
    // The number of combinations is M^N.
    // This loop effectively generates combinations in a base-M system,
    // then filters for strictly increasing sequences.
    for ( var a = 0; a < Math.pow( M, N ); a++ ) {

        // Increment the first element of the array. This is part of the
        // counter logic to generate the next combination.
        array[ 0 ]++;

        // Propagate carries if an element exceeds M.
        // This simulates incrementing a number in base M.
        for ( var b = 0; b < N; b++ ) {
            if ( array[ b ] > M ) {
                array[ b ] = 1; // Reset current element to 1
                array[ b + 1 ]++; // Increment the next element (carry)
            }
        }

        // Check if the current 'array' sequence is strictly ascending.
        // This is a filter for valid sequences A.
        var isAcs = true; // Assume ascending initially
        for ( var b = 0; b < N - 1; b++ ) {
            if ( array[ b ] > array[ b + 1 ] ) {
                isAcs = false; // Not ascending
                break; // No need to check further
            }
        }

        // If the sequence is not ascending, skip this combination and continue to the next
        if ( !isAcs ) continue;

        // Calculate points for the current valid ascending sequence
        wkPoint = 0; // Reset temporary points for this sequence

        // Iterate through all 'abcd' conditions
        for ( var i = 0; i < abcds.length; i++ ) {
            // Check if the condition (A[b-1] - A[a-1] == c) is met
            if ( abcds[ i ].c == array[ abcds[ i ].b - 1 ] - array[ abcds[ i ].a - 1 ] ) {
                wkPoint += abcds[ i ].d; // Add points if condition is true
            }
        }

        // Update the maximum points found so far
        if ( point < wkPoint ) point = wkPoint;

    } // End of main loop for combinations

    // Output the final maximum points found to the console
    console.log( point );

} // End of Main function

/*
 * Entry point of the script.
 * Creates a new Scanner instance by reading input from /dev/stdin,
 * then calls the Main function with this scanner.
 */
Main( new Scanner( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) );

// --- Debugging / Testing examples (commented out) ---

// Example usage with a hardcoded string input:
// Main( new Scanner( "33" ) );

/*
 * These comments illustrate how the Scanner methods might be used
 * if they were exposed or used directly outside the Main function.
 *
 * var str1 = sc.next();          // Reads next token as a string
 * var int1 = sc.nextInt();       // Reads next token and parses as an integer
 * var bd1 = sc.nextBigDecimal(); // Reads next token and parses as a float
 * var byte1 = sc.nextByte();     // Reads next token and attempts to create an Int8Array
 */