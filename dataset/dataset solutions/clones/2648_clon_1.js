/*
 * This JavaScript file defines a function to process a given input string.
 * The primary goal is to count the number of distinct segments
 * formed by accumulating characters, where a segment is considered
 * distinct if it's not identical to the previously accepted segment.
 */

// Define the main processing function that takes an input string.
function main ( input )
{
    // Declare a variable 'S' to hold the trimmed version of the input string.
    var S =     input.trim ( ); // Remove leading/trailing whitespace from the input.

    // Initialize a counter for distinct segments.
    var count       = 0;

    // 'before' will store the previously accepted distinct segment.
    var before          = "";

    // 'current' will accumulate characters to form the current segment.
    var current             = "";

    // 'debug' array is used to store all accepted segments for debugging purposes,
    // though not directly used in the final output calculation.
    var debug               = [];

    // Begin a loop to iterate through each character of the string 'S'.
    // The loop continues as long as 'i' (index) is less than the length of 'S'.
    for ( var i = 0 ; S.length > i ; i++ )
    {
        // Append the current character from 'S' to the 'current' segment string.
        current += S[i];

        // Check if the newly formed 'current' segment is identical to the 'before' segment.
        if (    current === before )
        {
            // If they are identical, it means we're still extending a duplicate.
            // We skip the rest of this iteration and move to the next character.
            continue;
        }

        // If the 'current' segment is different from 'before', it's a new distinct segment.

        // Update 'before' to store this new distinct 'current' segment.
        before          = current;

        // Add the new distinct segment to the 'debug' array.
        debug.push ( current );

        // Reset 'current' to an empty string to start accumulating the next segment.
        current             = "";

        // Increment the count of distinct segments found.
        count++;
    }

    // After processing all characters, print the final count of distinct segments to the console.
    console.log ( count );
}

// This line handles the execution of the 'main' function.
// It reads content from standard input (typically a file in competitive programming environments),
// decodes it as UTF-8, and then passes it as an argument to the 'main' function.
main ( require ( "fs" ).readFileSync ( "/dev/stdin", "utf8" ) );