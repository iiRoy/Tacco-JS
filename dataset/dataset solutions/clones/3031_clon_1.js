/*
 * This file enforces strict parsing and execution of JavaScript code.
 * It's a best practice for modern JavaScript development.
 */
'use strict'



// Define the main entry point function for the program.
// It takes a single string 'input' as an argument.
const    main   =   (   input   )    =>
{
    // This block processes the input data.
    // First, split the input string by newline characters to get individual lines.
    // Then, for each line, use the 'map' function to further split it by spaces,
    // resulting in an array of argument arrays.
    const   args    =    input .  split (  '\n'  ) .  map (   arg   =>   arg .  split (  ' '  )   )


    // Parse the first element of the first line of arguments into an integer 'a'.
    // The '10' indicates base-10 parsing for numerical conversion.
    const   a    =    parseInt (  args [  0  ] [  0  ] ,   10   )

    // Parse the second element of the first line of arguments into an integer 'b'.
    // This value will be used in comparison operations later.
    const   b    =    parseInt (  args [  0  ] [  1  ] ,   10   )

    // Parse the third element of the first line of arguments into an integer 'c'.
    // This is the value whose position relative to 'a' and 'b' we are checking.
    const   c    =    parseInt (  args [  0  ] [  2  ] ,   10   )


    // Check the primary condition: if 'c' is strictly between 'a' and 'b' (a < c AND c < b).
    // This checks for the ascending order scenario.
    if   (   a    <    c    &&    c    <    b   )
    {
        // If the condition is true, output 'Yes' to standard output.
        console .  log (  'Yes'  )
    }
    // Otherwise, if the first condition is false, check the secondary condition:
    // if 'c' is strictly between 'b' and 'a' (b < c AND c < a).
    // This checks for the descending order scenario.
    else   if   (   b    <    c    &&    c    <    a   )
    {
        // If this alternate condition is true, also output 'Yes'.
        console .  log (  'Yes'  )
    }
    // If neither of the above conditions (a < c < b or b < c < a) is met,
    // then 'c' is not strictly between 'a' and 'b' in either order.
    else
    {
        // In all other cases, output 'No'.
        console .  log (  'No'  )
    }
}


// --- Program Execution Entry Point ---

// Use the Node.js 'fs' (file system) module to read input.
// 'readFileSync' is used for synchronous file reading.
// It reads from '/dev/stdin', which is a common path for standard input in Unix-like systems.
// The input is expected to be UTF-8 encoded.
// The read content (a string) is then passed as an argument to the 'main' function to start processing.
main (  require (  'fs'  ) .  readFileSync (  '/dev/stdin' ,   'utf8'  )   )

// --- End of Program Execution ---