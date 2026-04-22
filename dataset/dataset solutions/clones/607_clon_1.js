/*
 * This is a Type I code clone example generated for a JavaScript snippet.
 * In a Type I clone, the code's functionality and structure remain absolutely identical.
 * The only allowed modifications are variations in whitespace (spaces, tabs, newlines)
 * and the addition, removal, or modification of comments.
 *
 * The original purpose of this script is to read a string from standard input,
 * process it using a regular expression to find specific patterns of 'J', 'O', 'I' characters,
 * and then determine the maximum length of the 'O' sequence within valid patterns.
 * A pattern is considered valid if the count of 'J's and 'I's is greater than or equal to
 * the count of 'O's in that specific "JOI" sequence.
 */


// Begin Program Execution


    // Import the Node.js 'fs' (File System) module.
    // This module provides an API for interacting with the file system,
    // including reading files from standard input.
    var    input     =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) ;


    // Declare a new variable named 'str'.
    // Assign to 'str' the value of 'input' after removing
    // any leading or trailing whitespace characters using the `.trim()` method.
    var    str      =    input . trim ( ) ;


    // Initialize an empty array called 'arr'.
    // This array will serve as a storage for the lengths of
    // qualifying 'O' sequences found during the string processing.
    var    arr     =    [ ] ;


    // Reassign the 'str' variable with the result of a string replacement operation.
    // The `.replace()` method is used here with a regular expression and a callback function.
    //
    // Regular Expression: `/(J+)(O+)(I+)/g`
    //   - `(J+)`: Matches one or more 'J' characters. This is captured as the first group (s1).
    //   - `(O+)`: Matches one or more 'O' characters. This is captured as the second group (s2).
    //   - `(I+)`: Matches one or more 'I' characters. This is captured as the third group (s3).
    //   - `/g`: The global flag ensures that the replacement (and thus the callback)
    //           is applied to all occurrences of the pattern in the string, not just the first.
    //
    // Callback Function: `function(s, s1, s2, s3)`
    //   - `s`: The entire matched substring (e.g., "JJJOII").
    //   - `s1`: The content of the first capturing group (the 'J' sequence).
    //   - `s2`: The content of the second capturing group (the 'O' sequence).
    //   - `s3`: The content of the third capturing group (the 'I' sequence).
    str   =   str . replace (   / ( J+ ) ( O+ ) ( I+ ) / g ,   function   ( s ,   s1 ,   s2 ,   s3 )
    {
        // Inside the callback, a conditional check is performed.
        // The condition verifies if the length of the 'J' sequence (s1)
        // is greater than or equal to the length of the 'O' sequence (s2),
        // AND if the length of the 'I' sequence (s3) is also greater than or equal to
        // the length of the 'O' sequence (s2).
        if    (    s1 . length    >=    s2 . length    &&    s3 . length    >=    s2 . length    )
        {
            // If the condition evaluates to true, it means the current "JOI" pattern
            // is valid according to the criteria.
            // The length of the 'O' sequence (s2.length) is then added to the 'arr' array.
            arr . push ( s2 . length ) ;
        }

    }   ) ; // The 'replace' method finishes its iteration over the string.


    // Finally, after all valid 'O' sequence lengths have been collected in 'arr',
    // we calculate and display the maximum value among them.
    // `Math.max.apply(null, arr)` is used to call `Math.max` with the elements of `arr`
    // as individual arguments. If 'arr' is empty, `Math.max` returns -Infinity.
    console . log (   Math . max . apply (   null ,   arr   )   ) ;


// End Program Execution