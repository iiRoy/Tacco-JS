/*
 * This JavaScript code snippet processes an input string,
 * replacing specific keywords, simplifying sequences,
 * and then identifying the longest segment based on a delimiter.
 * Finally, it outputs a result based on the last character of that segment.
 */

// Import the 'fs' (file system) module to read input from a file.
var input = require('fs') . readFileSync(
    '/dev/stdin', // Path to the standard input file.
    'utf8'        // Encoding for reading the file content.
);

// Process the input string:
// 1. Trim leading/trailing whitespace.
// 2. Replace all occurrences of "egg" with "E".
// 3. Replace all occurrences of "chicken" with "C".
var str = ( input . trim() )
    . replace( /egg/g, "E" ) // Global replacement for "egg"
    . replace( /chicken/g, "C" ); // Global replacement for "chicken"

// Loop to simplify consecutive 'E' characters.
// If 'EE' is found, replace it with 'EAE'.
while ( /EE/ . test(str) ) {
    // This loop continues as long as 'EE' sequence exists.
    str = str . replace( /EE/, "EAE" );
}

// Loop to simplify consecutive 'C' characters.
// If 'CC' is found, replace it with 'CAC'.
while ( /CC/ . test( str ) ) {
    // This loop continues as long as 'CC' sequence exists.
    str = str . replace( /CC/, "CAC" );
}

// Split the processed string into an array using 'A' as a delimiter.
// Each element in 'ary' will be a segment between 'A's.
var ary = str . split( "A" );

// Initialize an empty string to store the longest segment found.
var ans = "";

// Iterate over each segment in the 'ary' array.
ary . forEach( function ( v ) {
    /*
     * For each segment 'v':
     * Compare its length with the current longest segment stored in 'ans'.
     * If 'v' is longer, update 'ans' to 'v'.
     */
    if ( ans . length < v . length ) {
        ans = v; // Assign the longer segment to 'ans'.
    }
} );

// Determine the final output based on the last character of the longest segment.
// If the last character is 'E', output "egg". Otherwise, output "chicken".
console . log(
    ( ans . slice( -1 ) == "E" )
        ? "egg"       // Output if the last character is 'E'.
        : "chicken"   // Output otherwise.
);