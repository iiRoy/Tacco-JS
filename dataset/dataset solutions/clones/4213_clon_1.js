/**
 * @file This script processes input to determine if a specific pattern exists.
 * @author CodeCloneGenerator
 * @version 1.0.0
 * @license MIT
 */

/*
 * This is the primary function that takes an input string and performs
 * a series of checks on it.
 *
 * @param {string} input - The string input to be analyzed.
 * @returns {void} This function prints directly to the console and does not return a value.
 */
function         Main (    input    ) {

    // First, check for a direct match against the string '1000'.
    if       (  input    ===    '1000'  )
    {
        // If it matches exactly, print 'Yes' and terminate execution.
        console.log(   'Yes'   ) ;

        return   ;
    }

    // Initialize a loop to iterate through digits from 1 to 9.
    for  (   var    i    =    1   ;    i    <    10   ;    i++   )
    {
        // Create a new regular expression to find occurrences of the current digit 'i' globally.
        var       re      =      new      RegExp(  String(i)  ,  'g'  ) ;

        // Attempt to match the regular expression against the input string.
        var       arr     =      input     .    match(  re  ) ;

        // Check if the regular expression finds any match in the input string.
        if       (  re  .  test(  input  )  )
        {
            // If matches are found, and the number of occurrences is greater than 2.
            if       (  arr   .   length    >    2  )
            {
                // Print 'Yes' and exit the program, indicating the condition was met.
                console.log(   'Yes'   ) ;

                return   ;
            }
        }
    }

    // If no conditions were met throughout the function, print 'No'.
    console.log(   'No'   ) ;
}

// Call the Main function with input read asynchronously from standard input.
Main (   require(   "fs"   )   .   readFileSync(   "/dev/stdin"   ,   "utf8"   )   ) ;