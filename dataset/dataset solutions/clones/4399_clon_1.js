/*
 * This is a Type I clone of an existing JavaScript file.
 * Only whitespace and comments have been altered.
 * All functional code remains identical.
 */
function main( input ) { // Main function definition
    const S = input.split( '' ); /* Convert input string to an array of characters */


    alphabetList = 'abcdefghijklmnopqrstuvwxyz'.split( '' ); /* Initialize the full alphabet list */

    // Remove duplicates from the input characters and sort them
    arr = S.filter( function ( x, i, self ) {
        // This callback function checks for unique elements
        return self.indexOf( x ) === i;
    } ).sort(); // Sort the unique characters alphabetically

    ans = arrDiff( arr, alphabetList ); // Call the helper function to find the difference

    /*
     * Helper function to find the difference between two arrays.
     * Specifically, it finds elements in alphabetList that are NOT in arr.
     * It uses an object as a hash set for efficient lookups.
     */
    function arrDiff( arr, alphabetList ) {
        var a = []; // Use an array as a hash map (object)
        var diff = []; // Array to store the differences

        // Populate the hash map 'a' with elements from 'arr'
        for ( var i = 0; i < arr.length; i++ ) {
            a[ arr[ i ] ] = true; /* Mark element as present */
        }

        // Iterate through the alphabet list to find differences
        for ( var i = 0; i < alphabetList.length; i++ ) {
            if ( a[ alphabetList[ i ] ] ) {
                delete a[ alphabetList[ i ] ]; /* If element exists in 'arr', remove it from 'a' */
            }
            else {
                a[ alphabetList[ i ] ] = true; /* If element does not exist in 'arr', add it to 'a' */
            }
        }

        // Extract the remaining keys from 'a' (these are the differences)
        for ( var k in a ) {
            diff.push( k ); // Add the key to the difference array
        }
        return diff; // Return the array of differences
    }

    // Check if any differences were found
    if ( ans.length != 0 ) { // If the difference array is not empty
        console.log( ans[ 0 ] ); // Print the first missing character
    }
    else { // If no differences (all alphabet characters were present)
        console.log( 'None' ); // Print 'None'
    }
}

// Execute the main function with input from standard input
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );