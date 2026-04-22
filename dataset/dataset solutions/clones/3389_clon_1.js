// This JavaScript program processes a string input to solve a specific problem.
// It is designed to count and replace patterns within the string until no more patterns are found.
// This file represents a Type I code clone, preserving all functional elements exactly as in the original,
// while making extensive changes to whitespace and comments for visual differentiation.

'use strict'   ;  //  Enforce strict mode, which helps catch common coding errors and "unsafe" actions.


const       main        =       (       INPUT       )       =>
{
        //  The main function takes the raw input string as its argument.

        let     S       =       INPUT   .   split   (   '\n'    )   [   0   ]   ;  //  Initialize the working string 'S'
                                                                                //  by taking the first line of the input.

        let     ans     =       0       ;  //  Initialize the answer variable 'ans' to zero.
                                        //  This variable will accumulate the count of 'BW' occurrences.


        //  Begin a loop that continues as long as the pattern "BW" is found within the string 'S'.
        while           (       S   .   match   (   /BW/    )       !==     null    )
        {
                //  If "BW" is found, count all its occurrences globally and add to 'ans'.
                ans     +=      S   .   match   (   /BW/g   )   .   length  ;

                //  Replace all occurrences of "BW" with "WB" in the string 'S'.
                //  This transformation is key to the problem's logic.
                S       =       S   .   replace   (   /BW/g   ,   'WB'    )   ;
        }

        //  After the loop terminates (meaning no more "BW" patterns are found),
        //  print the final accumulated answer to the console.
        console     .   log     (       ans     )   ;
}       ; //  End of the main function definition.


//  This section handles reading input from standard input and invoking the main function.
//  It uses Node.js's 'fs' module to synchronously read the entire file from '/dev/stdin'
//  and decodes it as a UTF-8 string before passing it to the 'main' function.
main    (   require (   'fs'    )   .   readFileSync    (   '/dev/stdin'    ,   'utf8'  )   )   ;

//  End of the JavaScript program.