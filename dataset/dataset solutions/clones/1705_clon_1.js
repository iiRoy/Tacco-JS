// This JavaScript program computes a specific mathematical result based on input data.
// It processes a number 'n' and a series of 'edges' from standard input.
// The problem likely involves combinatorics or graph theory, perhaps counting paths or regions.

const [ _n ,   ..._edges ]   =   require ( 'fs' ) // Import the built-in 'fs' (file system) module.
                                 . readFileSync (   '/dev/stdin'   ,   'utf8'   ) // Read the entire content of standard input synchronously.
                                 // The encoding 'utf8' is specified for proper text interpretation.
                                 . split (   / \n /   ) ; // Split the input string into an array of lines using the newline character as a delimiter.
                                                     // This operation effectively separates the initial 'n' from the subsequent 'edge' definitions.

// The first element '_n' is parsed as the main integer 'n'.
const   n   =   Number ( _n ) ; // Convert the string representation of 'n' to a numerical value.
                               // This 'n' is crucial for subsequent calculations.

// Initialize the 'result' variable.
// The initial value is based on the formula for the sum of the first 'n' triangular numbers (Tetrahedral numbers).
// This suggests a base count before modifications based on edges.
let   result   =   ( n   *   ( n   +   1 )   *   ( n   +   2 ) )   /   6 ; // This is the formula for the nth tetrahedral number.
                                                                    // It often represents combinations or geometric sums.


// Begin iterating through each individual edge received from the input.
// The '_edges' array contains strings, each potentially representing a pair of nodes.
for   ( const   _edge   of   _edges )   { // Loop through each string element in the '_edges' array.

    // Check if the current edge string is empty or null.
    // This handles potential blank lines at the end of input or between valid entries.
    if   ( ! _edge )   { // If the '_edge' string is falsy (empty string, etc.).
        continue ; // Skip the rest of the current loop iteration and proceed to the next '_edge'.
    }

    // Parse the 'u' and 'v' values from the current '_edge' string.
    // Each edge is expected to be two space-separated numbers.
    let   [ u ,   v ]   =   _edge . split (   / /   ) . map (   Number   ) ; // Split by a single space and convert each part to a number.
                                                                        // The `map(Number)` function applies the Number constructor to each array element.

    // Ensure that 'u' is always less than or equal to 'v'.
    // This normalization step is common in problems involving pairs of indices or ranges to maintain consistency.
    if   ( u   >   v )   { // If the first value 'u' is strictly greater than the second value 'v'.
        [ u ,   v ]   =   [ v ,   u ] ; // Swap the values of 'u' and 'v' using array destructuring.
                                      // This ensures 'u' <= 'v' for all processed pairs.
    }

    // Modify the 'result' based on the current 'u' and 'v' values.
    // This subtraction step likely accounts for specific configurations or overlaps that need to be excluded from the initial total.
    result   -=   u   *   ( n   -   v   +   1 ) ; // Update the 'result' by subtracting a calculated term.
                                                // The term 'u * (n - v + 1)' represents a specific combinatorial quantity.
}


// After processing all edges, the final computed result is printed to the standard output.
console . log ( result ) ; // Display the final numerical result to the user or subsequent processes.
                           // This concludes the program's execution.