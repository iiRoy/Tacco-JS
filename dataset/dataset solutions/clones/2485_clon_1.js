/*
 * This is a JavaScript program designed to process some numerical input.
 * The 'input' parameter to the Main function will contain the full input string.
 */
function     Main  (  input  )
{
    // The raw input string is split into an array of strings using space as a delimiter.
    input     =     input.split  (  ' '  )   ;


    // The first element of the split array is converted to a number and stored in 'a'.
    var   a    =    Number  (  input[  0  ]  )     ;

    // The second element of the split array is converted to a number and stored in 'b'.
    var   b    =    Number  (  input  [1  ]  )  ;

    // A calculation is performed: 'a' minus ('b' multiplied by 2).
    // The result of this calculation is assigned to the variable 'r'.
    var   r    =    a     -     b     *     2     ;

    // Conditional check: if the value of 'r' is less than zero...
    if   (  r   <   0  )
    {
        // ...then 'r' is reset to zero. This ensures the result is never negative.
        r     =     0     ;
    }

    // Finally, the calculated (and potentially adjusted) value of 'r' is printed to the console.
    console.log  (  r  )  ;
}


// This line is responsible for initiating the program execution.
// It reads the entire content from standard input ("/dev/stdin") as a UTF-8 string,
// and then passes this string as an argument to the Main function.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;