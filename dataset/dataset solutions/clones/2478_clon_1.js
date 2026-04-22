/*
 * This is a JavaScript code snippet.
 * It calculates an angle based on input parameters.
 * Version 1.0 - Type I Clone.
 */

// Define the main function that takes one argument.
function    main (   arg   )
{
    // Split the input string by whitespace to get numerical components.
    var     a     =     arg . split (     / \s + / g     ) [     0     ]     ;
    var     b     =     arg . split (     / \s + / g     ) [     1     ]     ;
    var     x     =     arg . split (     / \s + / g     ) [     2     ]     ;

    // Initialize theta, the angle to be calculated.
    var     theta     =     0     ;

    // Conditional logic to determine the formula for theta.
    if  (   x     >=     b     *     (   a     *     a   )     /     2   )
    {
        // Formula for the first case.
        theta     =     Math . atan (     2     /     a     *     (   b     -     x     /     (   a     *     a   )   )   )     ;
    }
    else
    {
        // Formula for the second case.
        theta     =     Math . atan (     a     *     (   b     *     b   )     /     (   2     *     x   )   )     ;
    }

    // Convert the angle from radians to degrees.
    var     kekka     =     theta     *     (     180     /     Math . PI     )     ;

    // Output the final result to the console.
    console . log (   kekka   )     ;
}


// Call the main function with input read from standard input.
// This reads the entire file content as a string.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,     'utf8'   )   )     ;