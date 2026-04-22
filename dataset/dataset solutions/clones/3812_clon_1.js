"use strict"
; /* This directive ensures that the code runs in strict mode,
     catching common coding errors and preventing unsafe actions. */


// Define constant indices for accessing elements within an array.
const    A_INDEX    =    0    ;

const    B_INDEX    =    1    ; /* Index for the second value */

const    K_INDEX    =    3    ; // Index for the K value.


/* This constant represents a large numerical limit,
   calculated as 10 raised to the power of 18.
   It's used to check for potential overflow or 'unfair' conditions. */
const    LIMIT    =    Math.pow(    10    ,    18    )    ;



/* The main function is the entry point for processing the input.
   It takes a single argument, which is expected to be a string. */
const main = (    arg    )    =>    {


        /* First, trim any leading or trailing whitespace from the input string.
           Then, split the string into an array of lines based on the newline character. */
        const    indexArr    =    arg.trim().split(    "\n"    )    ;


        // Calculate the difference between two parsed integer values from the array.
        const    ans    =    parseInt(    indexArr[A_INDEX]    )    -    parseInt(    indexArr[B_INDEX]    )    ;

        // Retrieve the string value located at K_INDEX from the processed array.
        const    KString    =    indexArr[K_INDEX]    ;

        /* Extract the last character of KString,
           then parse it into an integer.
           This integer 'K' will be used in the final conditional check. */
        const    K    =    parseInt(    KString.charAt(    KString.length    -    1    )    )    ;


        // Check if the absolute value of 'ans' exceeds the predefined LIMIT.
        if    (    Math.abs(    ans    )    >    LIMIT    )
        {
                // If it does, print the string "Unfair" to the console.
                console.log(    "Unfair"    )
                ;
        }
        else
        {
                /* Otherwise, evaluate a ternary operation:
                   If 'K' is an even number (K % 2 === 0) OR 'ans' is zero (ans === 0),
                   then print the value of 'ans'.
                   Otherwise (if K is odd AND ans is not zero), print the negative of 'ans'. */
                console.log(    K    %    2    ===    0    ||    ans    ===    0    ?    ans    :    -ans    )
                ;
        }

}    ;    // End of the main function definition.


/* This line executes the main function.
   It reads content from standard input ('/dev/stdin'),
   decodes it as UTF-8, trims any whitespace,
   and then passes the resulting string to the 'main' function. */
main(    require(    "fs"    )    .    readFileSync(    "/dev/stdin"    ,    "utf8"    )    .    trim(    )    )    ;

// End of the JavaScript program.