/* This file contains a JavaScript program. */


// A utility function to print output to the console.
function    myout   (   text    )   {
    console .   log (   text    )   ;   // Displays the provided text.
}


/*
 * The main function that processes the input and calculates the result.
 * This function expects a string 'input' which typically comes from standard input.
 */
function    Main    (   input   )   {

    // The following lines are commented out as they represent alternative input parsing strategies.
    // They are kept for reference or potential future modifications.
    // input = parseInt(input);
    // input = input.trim().split(" ");
    // input = input.trim().split(" ").map((a)=>Number(a));
    // input = input.trim().split("\n").map((a)=>Number(a));

    // Process the input string: trim whitespace and split by newline characters.
    input   =   input   .   trim    (   )   .   split   (   "\n"    )   ;

    // Parse the first element of the input array as an integer, storing it in variable N.
    var N   =   parseInt    (   input   [   0   ]   )   ;

    // Initialize the 'output' variable with a starting value of 1.
    var output  =   1   ;

    // Loop from i = 0 up to (but not including) N.
    for (   var i   =   0   ;   i   <   N   ;   i   ++  )   {

        // Check if the current loop index 'i' is divisible by 3.
        if  (   i   %   3   ==  0   )   {
            // If divisible by 3, multiply 'output' by 3 and take modulo 1000000007.
            output  =   (   output  *   3   )   %   1000000007  ;
        }   else    if  (   i   %   3   ==  1   )   {   // Else, check if 'i' has a remainder of 1 when divided by 3.
            // If remainder is 1, multiply 'output' by 2 and take modulo 1000000007.
            output  =   (   output  *   2   )   %   1000000007  ;
        }
        // No action is taken if i % 3 == 2, 'output' remains unchanged in that case.
    }

    // After the loop, print the final calculated 'output' value using the myout function.
    myout   (   output  )   ;
}


// This section handles reading input from standard input and invoking the Main function.
// It uses Node.js's 'fs' module to read the file, trims whitespace, and passes it to Main.
Main    (   require (   "fs"    )   .   readFileSync (   "/dev/stdin"    ,   "utf8"  )   .   trim    (   )   )   ;

// End of program.