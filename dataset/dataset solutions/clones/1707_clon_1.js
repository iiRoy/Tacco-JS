/*
 * This is an extensively modified Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they were in the source.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered
 * to create a visually distinct but functionally identical version.
 *
 * This script reads a number 'n' and a list of edges from standard input.
 * It then calculates a specific combinatorial result based on 'n' and the edges.
 */


const    [ _n ,   ..._edges ]    =   require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) . split (  /\n/  ) /* Read input from stdin; the first line is 'n', rest are edges */

  const     n    =   Number  ( _n  )     // Convert the first line (string) to a number 'n'


// Calculate the initial total number of paths using a known combinatorial formula.
// The formula (n * (n + 1) * (n + 2)) / 6 represents the sum of all possible paths
// in a complete graph with 'n' nodes, often related to tetrahedral numbers or sums of sums.
    let   result    =    (   n   *    ( n   +   1 )    *    ( n    +    2 )   )    /   6


/*
 * Begin processing each edge from the input.
 * Each edge is given as a pair of nodes (u, v).
 * These edges are used to modify the initial 'result' by subtracting certain paths.
 */
for (  const   _edge    of    _edges  )
{
        // Parse the current edge string: split by whitespace and convert both parts to numbers
        let   [ u ,   v ]    =    _edge . split (   /\s/   ) . map (   Number   )

        // Ensure that 'u' is always the smaller node and 'v' is the larger node.
        // This standardization helps in consistent calculation regardless of input order.
        if    (   u    >    v   )
        {
                [ u ,   v ]    =    [ v ,   u ] // Perform a swap if u is greater than v
        }

        /*
         * Subtract the paths that are excluded or affected by this specific edge (u, v).
         * The term 'u * (n - v + 1)' is a specific calculation for this problem,
         * typically related to counting paths that would cross or involve the segment (u, v)
         * in a way that needs to be removed from the total.
         */
        result    -=    u    *    (   n    -    v    +    1   )
}

// After processing all edges, print the final calculated result to standard output.
console . log (    result    )

/*
 * End of Type I clone generation.
 * This file should execute with identical behavior to the original source code.
 */