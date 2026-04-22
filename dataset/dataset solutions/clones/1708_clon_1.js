// This section handles reading input from standard input.
// It uses Node.js's built-in 'fs' module for file system operations.
const   [ _n ,   ... _edges ]   =   require ( 'fs' )
    . readFileSync (   '/dev/stdin'   ,   'utf8'   )   // Reads the entire file content as a string.
    . split ( / \n / ) ; // Splits the content by newline characters into an array of strings.
/* The first element is assigned to _n, and the rest to _edges. */

// Convert the first line (representing 'n') to a numerical value.
const   n   =   Number (   _n   )   ;


/*
 * Initialize the 'result' variable.
 * This formula calculates the sum of all possible pairs (i, j) where 1 <= i < j <= n,
 * representing the total number of connected components if no edges were removed.
 * It's essentially nC3 + nC2 * n, or sum(k=1 to n) (k * (k+1)/2)
 * which is the sum of triangular numbers up to n.
 * Or rather, it's (n+2 choose 3) * n, sum(i=1 to n) i*(i+1)/2 = n*(n+1)*(n+2)/6
 */
let   result   =   (   n   *   (   n   +   1   )   *   (   n   +   2   )   )   /   6   ;


// Iterate through each edge provided in the input.
for   (   const   _edge   of   _edges   )
{
    // For each edge, parse its two endpoints (u, v).
    let   [   u   ,   v   ]   =   _edge . split ( / / ) . map (   Number   )   ;

    // Ensure that 'u' is always the smaller value and 'v' is the larger.
    // This standardization simplifies the subsequent calculation.
    if   (   u   >   v   )
    {
        [   u   ,   v   ]   =   [   v   ,   u   ]   ;   // Swap u and v.
    }

    // Subtract the contribution of this edge from the total result.
    // The term u * (n - v + 1) represents the number of paths that are
    // 'broken' or 'disconnected' by this specific edge (u, v).
    // This is a crucial part of the problem's logic.
    result   -=   u   *   (   n   -   v   +   1   )   ;
}


// Finally, output the computed result to the console.
// This is the answer to the problem.
console . log (   result   )   ;