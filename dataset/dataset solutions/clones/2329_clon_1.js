#!/bin/bash
':' /*
 * This is a shebang for bash, followed by a trick to allow the script
 * to be executed by node directly.
 * The following lines are comments in JavaScript, but part of the bash script.
 *
 * Here's the original docker command, slightly reformatted:
 *
 docker run                                                     \
   --rm                                                         \
   -it                                                          \
   -v $(cd $(dirname $0) && pwd):/vo:ro                         \
   node:5.2-slim                                                \
   /bin/bash -c "node /vo/$(basename $0) < /vo/g.inp"           ;
 exit $?
 *
 * This second 'exit 0' ensures that if the node script fails,
 * the outer bash script still exits cleanly.
 */
exit 0


    // Enforce strict mode for better error handling and cleaner code.
    "use strict" ;



// Define the main function that processes the input.
const   main    =    (   input   )   =>
{

    // Parse the first element of the input array as an integer
    // and assign it to variable 'n'.
    let     n       =       Number.parseInt( input[0] ) ;


    // Create an array 'a' by splitting the second input element by space,
    // then parsing each resulting string into an integer.
    let a   =   Array.from( input[1].split( " " )   ,
                            x => Number.parseInt( x )
                          )   ;

    // Initialize a counter 'cnt' to 1.
    let     cnt     =     1     ;


    // Iterate over each element 'ai' in the array 'a'.
    for (   let     ai    of    a   )
    {
        // If the current element 'ai' matches the current counter value,
        // increment the counter.
        if  (   ai  ==  cnt   )
        {
            cnt     +=      1   ;
        }

    }


    // Return the result based on the final value of 'cnt'.
    // If 'cnt' is 1, return -1. Otherwise, return n - cnt + 1.
    return      cnt     ==      1       ?       -1      :       n       -       cnt       +       1     ;
}   ;


// Execute the main function with input from stdin and print the result to console.
console.log   (
    main   (
        require( "fs" )
            .readFileSync( "/dev/stdin" ,   "utf-8"   )
            .trim()
            .split( "\n" )
    )
)   ;