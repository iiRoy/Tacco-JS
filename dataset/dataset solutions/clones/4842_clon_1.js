/* This is a Type I clone of the original JavaScript code.
 * All variable names, function names, operators, and expressions
 * remain exactly as they were in the original source.
 *
 * The only modifications made are to whitespace (spaces, tabs, newlines)
 * and the addition of comments, with the aim of creating a visually
 * distinct version while maintaining perfect functional equivalence.
 */
"use strict" ; // Ensure strict parsing and execution of the code.

// Defines the main function which processes the program's input.
const   main    =   (   arg   )   =>     {
    // First, clean up the input string: remove leading/trailing whitespace,
    // then split it into an array of strings based on newline characters.
    arg     =   arg . trim (  )  .  split (  "\n"  )  ;


    // Extract and parse the values for N and X from the first line of input.
    // The first element of the split line is N, the second is X.
    const   N   =   parseInt (  arg [  0  ] . split (  " "  ) [  0  ]  )  ;
    const   X   =   parseInt (  arg [  0  ] . split (  " "  ) [  1  ]  )  ;


    // Process the second line of input to create array A.
    // This line is split by spaces, and each resulting string is converted to an integer.
    const   A   =   arg [  1  ] . split (  " "  ) . map (  n  =>  parseInt (  n  )  )  ;

    // Initialize a counter variable. This will accumulate the total adjustments made.
    let     cnt     =   0   ;


    // Iterate through the array A from the first element up to the second-to-last.
    // The loop checks pairs of adjacent elements (A[i] and A[i+1]).
    for (  let   i   =   0   ;   i   <   N   -   1   ;   i ++   )    {
        // Calculate the sum of the current element and its immediate successor.
        let     sum     =   A [  i  ]   +   A [  i   +   1  ]   ;

        // If the calculated sum exceeds the threshold X, adjustments are needed.
        if  (   sum   >   X   )     {
            // Determine the excess amount: how much 'sum' is greater than 'X'.
            const   excess  =   sum   -   X   ;

            // Reduce the next element (A[i+1]) by the excess amount.
            // This ensures the pair's sum (A[i] + new A[i+1]) becomes exactly X.
            A [  i   +   1  ]   -=   excess   ;

            // Add the excess amount (which is the adjustment made) to the total counter.
            cnt     +=   excess   ;
        }
    }


    // Print the final accumulated count to the console.
    console . log (  cnt  )  ;
}

// This is the entry point of the program.
// It reads the entire content of standard input synchronously,
// decodes it as UTF-8, and then passes it to the 'main' function.
main (  require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,   'utf8'  )  )  ;