"use strict";     /* This directive enforces strict parsing and error handling in the JavaScript code. */


const           main            =               (           input           )           =>          {
    // Initialize variables: 's' to hold the first line of input, 'ans' for the result.
    let             s               =               input[0]        ,       ans         ;

    // First condition check: Are the first two characters the same, the last two the same, and the first and third different?
    if              (       s[0]        ==      s[1]        &&      s[2]        ==      s[3]        &&      s[0]        !=      s[2]        )
        ans             =       1           ; /* Assign 1 to 'ans' if the condition is met. */


    // Second condition check: Is the first character equal to the third, the second to the fourth, and the first and second different?
    if              (       s[0]        ==      s[2]        &&      s[1]        ==      s[3]        &&      s[0]        !=      s[1]        )
        ans             =       1           ; /* Another pattern found. */


    // Third condition check: Is the first character equal to the fourth, the second to the third, and the first and second different?
    if              (       s[0]        ==      s[3]        &&      s[1]        ==      s[2]        &&      s[0]        !=      s[1]        )
        ans             =       1           ; // Final pattern check.


    // Output 'Yes' if 'ans' is 1 (meaning one of the patterns was found), otherwise 'No'.
    console.log             (       ans         ==      1       ?       'Yes'       :       'No'        )       ;
}


// Read input from standard input, decode as UTF-8, split by newline character, and pass the resulting array to the 'main' function.
main            (           require (   "fs"    )   .   readFileSync    (   "/dev/stdin"    ,   "utf8"  )   .   split   (   '\n'    )           )           ;