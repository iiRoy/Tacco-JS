"use strict"
; /*
    This directive ensures that the code is executed in "strict mode".
    Strict mode helps write cleaner code and avoids common pitfalls.
*/


const main = arg => {
    // Normalize the input: remove leading/trailing whitespace and split into an array of lines.
    arg = arg.trim().split("\n")
    ;

    // The first line of the input is assigned to the constant X.
    const X = arg[0]
    ;


    // Check if the value of X is less than 100.
    // This is an early exit condition based on the problem's constraints.
    if ( X < 100 ) {
        console.log(0)
        ; // Output 0 to the standard output as per problem specification.
        return
        ; // Terminate the function's execution immediately.
    }


    /*
     * The following block of code focuses on manipulating the last two digits of X.
     * The goal is to determine a 'count' based on reducing these digits to zero
     * using a specific sequence of modulo operations.
     */
    // Extract the last two digits (tens and units place) from the string X.
    // X is first split into characters, then the last two are taken, and finally rejoined and parsed as an integer.
    let digit10 = parseInt( X.split("").slice(-2).join("") )
    ;

    // Initialize a counter variable. This will track the number of operations performed.
    let cnt = 0
    ;


    // Handle the special case where the last two digits are already zero.
    // If 'digit10' is 0, it implies X is a multiple of 100, which usually means 1 operation.
    if ( digit10 === 0 ) {
        console.log(1)
        ; // Output 1, indicating it's a valid scenario.
        return
        ; // Exit the function.
    }


    // Another specific condition: if 'digit10' is 1.
    // In this case, 'cnt' is directly assigned the value of 'digit10'.
    if ( digit10 === 1 ) {
        cnt = digit10
        ;
    }


    // Main loop: continue as long as 'digit10' is not zero.
    // This loop iteratively modifies 'digit10' using modulo operations.
    while ( digit10 !== 0 ) {
        // Increment the counter for each pass through the loop.
        cnt++
        ;

        // Apply a series of conditional modulo operations to 'digit10'.
        // The largest possible modulo is tried first.
        if ( digit10 >= 5 ) {
            digit10 = digit10 % 5
            ;
        } else if ( digit10 >= 4 ) {
            digit10 = digit10 % 4
            ;
        } else if ( digit10 >= 3 ) {
            digit10 = digit10 % 3
            ;
        } else if ( digit10 >= 2 ) {
            digit10 = digit10 % 2
            ;
        } else if ( digit10 >= 1 ) {
            digit10 = digit10 % 1
            ; // Modulo by 1 always results in 0, effectively ending the loop if digit10 was 1.
        }
    }


    // The following line was commented out in the original code, likely for debugging.
    // console.log("The calculated count of operations for digit10 reduction is: " + cnt);


    // Final conditional check using the computed 'cnt' and the original 'X'.
    // This determines the ultimate output of the program.
    if ( ( 100 * cnt ) < X ) {
        console.log(1)
        ; // Output 1 if the condition is met.
    } else {
        console.log(0)
        ; // Otherwise, output 0.
    }
}


// Execute the main function by reading input from standard input.
// The 'fs' module is used to read the file at '/dev/stdin' with 'utf8' encoding.
main( require('fs').readFileSync('/dev/stdin', 'utf8') )
;