'use strict' /* This directive enables strict mode for the entire script. */

// Define the main function that processes the input.
const   main   =   (   input   )    =>    {


    // First, process the raw input string.
    // It's split by spaces, and each part is converted to an integer.
    input  =  input  .  split  (  ' '  )  .  map  (  i  =>  parseInt  (  i  )  )

    /*
     * Extract the three crucial values from the parsed input array.
     * A represents the starting number.
     * B represents the ending number.
     * K represents the count of elements to take from start and end.
     */
    const   A   =   input   [   0   ]
    const   B   =   input   [   1   ]
    const   K   =   input   [   2   ]

    // Initialize an empty array to store the sequence of numbers.
    let   arr   =   [   ]

    // Populate the array with numbers from A to B, inclusive.
    for  (  let   i   =   A   ;   i   <=   B   ;   i   ++   )   {
        arr   .   push   (   i   )   // Add the current number to the array.
    }
    /* The loop has finished populating 'arr'. */


    // Extract the first K elements from the array.
    const   first   =   arr   .   slice   (   0   ,   K   )
    // Extract the last K elements from the array.
    const   last   =   arr   .   slice   (   -K   )

    // Combine the 'first' and 'last' arrays into a Set to automatically handle duplicates
    // and ensure only unique values are stored.
    const   ans   =   new   Set   (   [   ...   first   ,   ...   last   ]   )

    // Iterate over each unique value in the 'ans' Set
    // and print it to the console on a new line.
    ans   .   forEach   (   v   =>   console   .   log   (   v   )   )

}

// Execute the main function with input read from standard input.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf-8'   )   )   ;   // Call the main function.