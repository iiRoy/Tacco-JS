/*
 * This JavaScript file processes a string to find the distance between
 * the first 'A' and the last 'Z' characters.
 * It's designed to read input from standard input.
 */

'use strict' // Enforces strict parsing and error handling rules.


// Define the main function that will handle the core logic.
const    main    =    (   input   )    =>    {

    // Extract the first line of the input string.
    const    str     =     input .  split (  '\n'  )  [  0  ]    ;

    // Convert the extracted string into an array of characters.
    const    strArr  =     str   .  split (  ''    )    ;

    // Create a reversed copy of the character array.
    // This helps in finding the index of the last 'Z'.
    const    strArrR =     strArr.  slice (  )    .  reverse (  )    ;

    // Determine the total length of the character array.
    const    strLen  =     strArr.  length   ;


    // Find the index of the first occurrence of the character 'A'.
    const    Aindex  =     strArr.  indexOf (  'A'   )    ;

    // Calculate the index of the last occurrence of 'Z'.
    // We subtract the index of 'Z' in the reversed array from the total length.
    const    Zindex  =     strLen   -    strArrR.  indexOf (  'Z'   )    ;

    // Output the difference between the Z index and the A index.
    // This represents the distance between the first 'A' and the last 'Z'.
    console .  log    (   Zindex   -    Aindex   )    ;
}


// Invoke the main function immediately.
// It reads the entire content of standard input as a UTF-8 string.
main     (    require (  'fs'  )  .  readFileSync (  '/dev/stdin'  ,   'utf-8'  )    )    ;

// End of script execution.