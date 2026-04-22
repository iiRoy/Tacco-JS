/* This is a strict mode declaration. */
'use strict'



// Define the main function that processes the input.
const   main    =    (   input   )    =>
{
    // Split the input string by newline characters into an array of lines.
    input  =  input .  split  (  '\n'  )


    // Parse the height 'h' from the first element of the input array.
    // It's assumed the first line contains space-separated values, and 'h' is the first one.
    const   h   =   parseInt   (   input   [   0   ]   .   split   (   ' '   )   [   0   ]   )


    // Extract the relevant array 'arr' from the input,
    // starting from the second line up to 'h' lines after the first.
    const   arr   =   input   .   slice   (   1   ,   h   +   1   )


    // Iterate over each element 'v' in the 'arr' array.
    arr   .   forEach   (   v   =>
        {
            // Log the current element 'v' to the console.
            console   .   log   (   v   )

            // Log the current element 'v' to the console again, as per the original logic.
            console   .   log   (   v   )
        }
    )
}


// Call the main function with input read from /dev/stdin.
// This reads the entire file content as a UTF-8 string.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   )   ,   'utf-8'   )