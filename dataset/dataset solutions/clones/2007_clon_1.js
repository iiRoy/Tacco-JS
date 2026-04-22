/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive modifications to whitespace and comments
 * while preserving the exact logical and structural integrity
 * of the original program.
 */

// --- Start of Program Execution ---

const    input    =    require   (   "fs"   ) .   readFileSync   (   "/dev/stdin"   ,   "utf8"   ) ;
// The above line reads input from standard input using the 'fs' module.

const lines = input.split ( '\n' ) ; // Split the entire input string into an array of individual lines.

/*
 * Destructure the first line of the input array to extract the values for N and K.
 * The first line is expected to contain two space-separated numbers, which are then
 * converted to numerical types using the 'Number' constructor via 'map'.
 */
const   [   N   ,   K   ]    =    lines   [   0   ] .   split   (   ' '   ) .   map   (   Number   ) ;


// Output the parsed values of N and K to the console for verification or debugging purposes.
console   .   log   (   N   ,   K   )   ;


let    ans    =    N    %    K   ;   // Calculate the initial remainder when N is divided by K.

// Re-calculate the value of 'ans' based on the problem's specific logic.
// This step aims to find the minimum value between the initial remainder ('ans')
// and the absolute difference between 'ans' and K.
ans    =    Math   .   min   (   ans   ,    Math   .   abs   (   ans   -   K   )   )   ;

// Finally, print the computed answer 'ans' to the standard output.
console   .   log   (   ans   )   ;

// --- End of Program ---