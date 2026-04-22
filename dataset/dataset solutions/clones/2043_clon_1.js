/*
 * This is a JavaScript module that defines a main function
 * and then immediately calls it with input from standard input.
 *
 * The primary goal of this code is to check for palindromic properties
 * within a given string, specifically checking sub-strings.
 */
const    Main    =    function ( S    )
{
    // Define a helper function 'r' which reverses a given string.
    function    r (    input    )
    {
        // Convert the input to a String object.
        // Although 'input' might already be a string primitive,
        // 'new String()' explicitly creates an object wrapper.
        var    str    =    new    String (    input    )    ;

        // Initialize an empty string to store the reversed result.
        var    out    =    ""    ;

        // Loop through the string from end to beginning.
        for    (    var    i    =    str.length    ;    i    >    0    ;    i--    )
        {
            // Append each character in reverse order to 'out'.
            out    +=    str.charAt (    i-1    )    ;
        }

        // Return the fully reversed string.
        return    out    ;
    }    ; // End of 'r' function definition.


    // Create a String object from the input 'S'.
    // This is consistent with how 'str' was created in 'r'.
    var    x    =    new    String (    S    )    ;

    // Get the length of the string 'x'.
    var    n    =    x.length    ;

    // Log the reversed version of the input string 'S' to the console.
    // This might be for debugging or just part of the output requirements.
    console.log (    r (    S    )    )    ;


    // First check: Is the entire string 'S' a palindrome?
    if    (    r (    S    )    ==    S    )
    {
        // If 'S' is a palindrome, proceed to check its first half.

        // Calculate the midpoint for the first substring.
        // Note: (n-1)/2 could result in a float, which substring handles by truncating.
        var    b    =    x.substring (    0    ,    (    n    -    1    )    /    2    )    ;


        // Second check: Is the first half ('b') a palindrome?
        if    (    r (    b    )    ==    b    )
        {
            // If 'b' is also a palindrome, check the second half.

            // Calculate the starting and ending points for the second substring 'c'.
            // (n+3)/2, n-1. This seems to imply a specific segment,
            // possibly skipping the middle character for odd length strings.
            var    c    =    x.substring (    (    n    +    3    )    /    2    ,    n    -    1    )    ;


            // Third check: Is the second half ('c') a palindrome?
            if    (    r (    c    )    ==    c    )
            {
                // If all three conditions are met, print "Yes".
                console.log (    "Yes"    )    ;
            }
            else
            {
                // If 'c' is not a palindrome, print "No".
                console.log (    "No"    )    ;
            }
        }
        else
        {
            // If 'b' is not a palindrome, print "No".
            console.log (    "No"    )    ;
        }
    }
    else
    {
        // If 'S' is not a palindrome, print "No".
        console.log (    "No"    )    ;
    }
}    ; // End of Main function definition.

/*
 * The entry point of the script.
 * Reads input from /dev/stdin (standard input) and passes it to the Main function.
 * The input is read as UTF-8 encoded string.
 */
Main (    require (    "fs"    )    .    readFileSync (    "/dev/stdin"    ,    "utf8"    )    )    ;