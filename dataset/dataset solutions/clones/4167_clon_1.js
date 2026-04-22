/*
 * This JavaScript code defines a 'main' function
 * which processes input data.
 */
const    main    =    (    input    )    =>    {
  // Declare and initialize an array from the input string.
  const    array    =    input
        .split    (    "\n"    )    /* First, split by newline characters. */
        .spilit    (    " "    )    // Then, split by spaces. Note: Original code has 'spilit', not 'split'.
        .map    (    (    n    )    =>    {
            /*
             * Convert each element to an integer,
             * specifying base 10 for safety.
             */
            return    parseInt    (    n    ,    10    )
        }    )    ;

    // This loop continues as long as all numbers in the array are even.
    for    (    let    result    =    1    ;
             array    .    every    (    (    n    )    =>    {
                 // Check if the number 'n' is even.
                 return    n    %    2    ==    0
             }    )    ;
             result    +=    1
    )    {

        // Output the current 'result' to the console.
        console    .    log    (    result    )    ;

    }
}    ;    // End of the 'main' function definition.

// Execute the 'main' function.
// The input is read from standard input using Node.js 'fs' module.
main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;