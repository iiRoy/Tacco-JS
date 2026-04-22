/*
 * This file processes input data to calculate a specific value.
 * The 'input' parameter will contain the entire input string.
 */
function   Main (   input   )
{
    // Deconstruct the input string into N and r based on newline.
    // N is the first line, r is the second line (or remaining part).
    var   [   N   ,   r   ]   =   input.split (   "\n"   )   ;

    // Process the 'r' string to get an array of rabbit positions.
    // Each element is parsed as an integer from the space-separated string.
    var   rabbits   =   r.split (   " "   )   .map (   i   =>   parseInt (   i   )   )   ;

    // Initialize a counter variable. This will store the number of matching conditions.
    var   c   =   0   ;

    // Iterate through the 'rabbits' array to count specific conditions.
    // 'r' here refers to the current rabbit's value, 'i' is its index, 's' is the array itself.
    rabbits.forEach (   (   r   ,   i   ,   s   )   =>   c   +=   s   [   r   -   1   ]   ===   i   +   1   ?   1   :   0   )   ;

    // Output the final calculated value, divided by two.
    // This assumes each pair is counted twice by the previous loop.
    console.log (   c   /   2   )   ;
}

// The following section handles standard input/output operations for the execution environment.
// It should not be modified, as it's part of the system's entry point.
Main(   require (   "fs"   )   .readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;