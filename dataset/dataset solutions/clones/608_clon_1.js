// This script reads input from stdin, processes it to find specific character patterns,
// and then outputs the maximum length of a certain sequence found.

// Import the 'fs' (file system) module to handle file operations.
var input = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' );


// Trim any leading or trailing whitespace from the input string.
var str = input . trim();


// Initialize an array to store lengths.
// Starting with 0 ensures that Math.max works correctly even if no valid sequences are found.
var arr = [ 0 ];


// Use the String.prototype.replace method with a regular expression.
// The regex /(J*)(O*)(I*)/g matches any sequence of zero or more 'J's, followed by
// zero or more 'O's, followed by zero or more 'I's.
// The 'g' flag ensures that all occurrences are matched, not just the first one.
str . replace( /(J*)(O*)(I*)/g, function( s, s1, s2, s3 )
{
    // s: The full matched string (e.g., "JJJOII")
    // s1: The captured group for 'J's (e.g., "JJJ")
    // s2: The captured group for 'O's (e.g., "O")
    // s3: The captured group for 'I's (e.g., "II")

    // Check the condition: the number of 'J's must be greater than or equal to the number of 'O's,
    // AND the number of 'I's must be greater than or equal to the number of 'O's.
    if ( s1 . length >= s2 . length && s3 . length >= s2 . length )
    {
        // If the condition is met, push the length of the 'O' sequence (s2) into our array.
        arr . push( s2 . length );
    }

    // Return an empty string. The return value of the replace callback is used to replace
    // the matched substring in the original string. Here, we are not interested in modifying
    // the string, so returning an empty string effectively removes the matched patterns.
    // However, the side effect of populating 'arr' is what we care about.
    return "";
}
);


// Finally, print the maximum value found in the 'arr' array.
// Math.max.apply(null, arr) is used to call Math.max with the elements of 'arr' as arguments.
// 'null' is passed as the 'this' context because Math.max doesn't depend on it.
console . log( Math . max . apply( null, arr ) );