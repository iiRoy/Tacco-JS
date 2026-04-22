/*
 * This file processes a series of test cases from standard input.
 * Each test case involves reading a list of names, transforming them,
 * sorting the transformed names, and then calculating a specific metric
 * based on common prefixes between adjacent names.
 */
var input = require("fs") . readFileSync("/dev/stdin", "utf8" ) ;

input = input . split("\n") ; // Split the entire input into an array of lines

// Initialize an index to keep track of the current line being read from the input array
var index = 0 ;

var _loop_1 = function()
{
    // Read the number of names for the current test case.
    // The '+' converts the string to a number.
    var n = +input [ index++ ] ;

    // If 'n' is 0, it signifies the end of input or a break condition.
    if ( n == 0 )
    {
        return "break" ; // Signal the main loop to terminate
    }

    var s = [ ] ; // Initialize an empty array to store the names for this test case

    // Loop 'n' times to read each name for the current test case
    for ( var i = 0 ; i < n ; i++ )
    {
        s . push( input[index++] ) ; // Add the current line (name) to the 's' array
    }

    // Process each name: keep only the characters before the first vowel, then sort.
    s = s . map( function( name )
    {
        var result = "" ; // String to build the transformed name
        var flg = true ; // Flag to indicate if the next character should be added (true after a vowel or at start)

        // Iterate over each character in the original name
        for ( var _i = 0, name_1 = name ; _i < name_1 . length ; _i++ )
        {
            var c = name_1[ _i ] ; // Current character

            if ( flg )
            {
                result += c ; // Add character to result
                flg = false ; // Reset flag, next char won't be added unless a vowel is encountered
            }

            // Check if the current character is a vowel (a, i, u, e, o)
            if ( /[aiueo]/.test( c ) )
            {
                flg = true ; // Set flag to true, indicating the next character (if any) should be added
            }
        }
        return result ; // Return the transformed name
    }) . sort(); // Sort the array of transformed names alphabetically

    // Helper function to count the length of the common prefix between two strings.
    // Returns -1 if strings are identical.
    // Returns 'l' (min length) if one is a prefix of the other.
    var countDuplicate = function ( s1, s2 )
    {
        var l = Math . min( s1 . length, s2 . length ) ; // Get the length of the shorter string

        // Compare characters at each position up to the minimum length
        for ( var i = 0 ; i < l ; i++ )
        {
            if ( s1[i] != s2[i] )
            {
                return i ; // Return the index where the first difference is found
            }
        }

        // If the loop completes, strings are identical up to 'l'.
        // Check if their total lengths are also identical.
        if ( s1 . length == s2 . length ) {
            return -1 ; // Strings are exactly the same
        }

        return l ; // One string is a prefix of the other; return the length of the common prefix
    }; // End of countDuplicate function

    var result = 0 ; // Initialize the result for the current test case

    // Iterate through the sorted array of transformed names to find the maximum common prefix length.
    for ( var i = 0 ; i < n ; i++ )
    {
        if ( i == 0 )
        {
            continue ; // Skip the first element as there's no preceding element to compare with
        }

        // Compare the current string with the previous one
        var c = countDuplicate( s[i - 1], s[i] ) ;

        // If countDuplicate returns -1, it means two adjacent strings are identical.
        if ( c == -1 )
        {
            result = -2 ; // Set result to -2 as a special indicator for identical strings
            break ; // No further processing needed for this test case
        }

        // Update 'result' if the current common prefix length 'c' is greater than the previously found maximum
        if ( c > result )
        {
            result = c ;
        }
    }

    console . log( result + 1 ) ; // Output the final result (add 1 as per problem requirements)
}; // End of _loop_1 function definition

// Main loop to process multiple test cases
while ( true )
{
    var state_1 = _loop_1() ; // Execute one iteration of the test case processing logic

    // Check if the _loop_1 function signaled to 'break'
    if ( state_1 === "break" )
    {
        break ; // Exit the main processing loop
    }
}
// End of the entire script execution.