/*
 * This file processes standard input data.
 * The primary function, Main, orchestrates the parsing and calculation.
 * It's designed to read two integer dimensions, H and W, from the input,
 * and then computes a specific value 't' based on these dimensions.
 */
function       Main    (  input   )     {

    // The 'input' parameter initially holds the entire standard input content.
    // For this particular problem, we are interested only in the very first line.
    input = input . split  (  "\n"  )   [  0  ]   ;


    // Now, we need to parse the first line to extract the numerical values.
    // The numbers are expected to be separated by a single space character.
    // We use 'map' with 'parseInt' to convert the string parts into integers.
    tmp      =  input  .  split   (   ' '   )   .   map  ( v  =>  parseInt (  v   )  )  ;


    // Assign the extracted integer values to their respective variables.
    // 'H' represents the height, and 'W' represents the width.
    H       =    tmp    [    0    ]    ;

    W       =    tmp    [    1    ]    ;


    // Implement the core logic to determine the value of 't'.
    // There's a special condition if either H or W is equal to 1.
    if   (   H   ==1   ||   W   ==1   )
    {
        // If either dimension is 1, the value of 't' is simply 1.
        t     =     1     ;
    }
    else
    {
        // Otherwise, 't' is calculated using a specific arithmetic formula.
        // This formula involves the product of H and W, plus one, all divided by two.
        t    =    (   H    *    W    +    1    )    /    2    ;
    }


    // Finally, print the computed value of 't' to the standard output.
    // This is the expected result of the program.
    console . log  (  t  )  ;
}


/*
 * DO NOT MODIFY THE CODE BELOW THIS LINE.
 * This section is responsible for reading input from standard I/O
 * and then invoking the 'Main' function with the collected data.
 * It ensures that the program can be run in a typical competitive programming environment.
 */
Main  (  require   (  "fs"  )  .  readFileSync   (  "/dev/stdin"  ,  "utf8"  )  )  ;