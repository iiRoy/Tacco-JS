// This is a Type I clone of the original JavaScript code.
// The purpose of this clone is to demonstrate variations in whitespace and comments
// while strictly maintaining the exact sequence of all tokens (keywords, identifiers, operators, literals).

'use strict' /* This directive ensures the code runs in strict mode, catching common coding errors and preventing unsafe actions. */ ;


// The primary function, named 'main', takes a single argument 's'.
function   main   (   s   )
{
    // First, process the input string 's'.
    // It's split by newline characters, and only the first line is taken.
    // That line is then split by space characters.
    // Finally, each resulting string fragment is converted into a Number.
    s   =   s . split (   '\n'   )   [   0   ]   .   split   (   ' '   )   .   map   (   n   =>   Number   (   n   )   )   ;

    // Declare a variable 'a' and assign it the first element from the processed array.
    let   a   =   s   [   0   ]   ;

    // Declare a variable 'b' and assign it the second element from the processed array.
    let   b   =   s   [   1   ]   ;

    // Conditional logic: If 'a' is strictly equal to 1, then add 13 to 'a'.
    if   (   a   ===   1   )   {
        a   +=   13   ; // This modifies 'a' based on a specific game rule.
    }

    // Conditional logic: If 'b' is strictly equal to 1, then add 13 to 'b'.
    if   (   b   ===   1   )   {
        b   +=   13   ; // This modifies 'b' based on the same game rule.
    }

    // Initialize an empty string variable to hold the final answer.
    let   ans   =   ''   ;

    // Determine the outcome based on the comparison of 'a' and 'b'.
    // If 'a' is strictly greater than 'b', Alice wins.
    if   (   a   >   b   )
    {
        ans   =   'Alice'   ; // Assign 'Alice' to 'ans'.
    }

    // If 'a' is strictly less than 'b', Bob wins.
    if   (   a   <   b   )
    {
        ans   =   'Bob'   ; // Assign 'Bob' to 'ans'.
    }

    // If 'a' is strictly equal to 'b', it's a draw.
    if   (   a   ===   b   )
    {
        ans   =   'Draw'   ; // Assign 'Draw' to 'ans'.
    }

    // Output the computed answer to the console.
    console . log   (   ans   )   ;
}


// This section of code handles reading input and initiating the main logic.
// It uses the built-in 'fs' (file system) module to read from standard input.
// The input is read synchronously and decoded as UTF-8.
// The entire content is then passed as the argument 's' to the 'main' function.
main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// End of the JavaScript program.