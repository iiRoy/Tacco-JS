/*
 * This JavaScript program processes input from standard input.
 * It aims to solve a specific counting problem based on an array of numbers.
 *
 * The problem involves finding pairs (i, k) from an array A such that:
 * k - i == A[i] + A[k]
 *
 * This equation can be rearranged for efficient lookup:
 * k - A[k] == A[i] + i
 *
 * We will use a hash map (object in JS) to store frequencies of (A[i] + i + 1) values.
 * Note: The original problem statement might imply 0-indexed or 1-indexed.
 *       The given code uses `a + i + 1` and `k + 1 - a`, suggesting a 1-based indexing adjustment.
 *       Let's assume the constants `+ 1` and `- 1` are part of the core logic.
 *
 */


const    lines    =    require('fs') . readFileSync(   '/dev/stdin'   ,   'utf8'   ) . split('\n')    ;


// Parse the first line to get the number of elements, N.
const   N   =   +lines[0]   ;

/*
 * The second line contains space-separated numbers.
 * Split this string into an array and convert each element to a number.
 */
const   A   =   lines[1] . split(' ') . map(   v   =>   +v   )   ;


// Initialize an empty object to serve as a frequency map.
// This map will store counts of `a + i + 1` values.
const   map   =   {}   ;


A . forEach(   (   a   ,   i   )   =>   {
        // Calculate the key for the map based on the current element 'a' and its index 'i'.
        const   mapKey   =   a   +   i   +   1   ;

        if   (   !map[mapKey]   )
        {
            // If this key is encountered for the first time, initialize its count to 1.
            map[mapKey]   =   1   ;
        }
        else
        {
            // If the key already exists, increment its frequency count.
            map[mapKey]   ++   ;
        }
    }
)   ;


// Initialize a variable to accumulate the final count of valid pairs.
let   count   =   0   ;


/*
 * Iterate through the array 'A' a second time.
 * For each element at index 'k', we will look up a corresponding value in our map.
 */
A . forEach(   (   a   ,   k   )   =>   {
        // Calculate the target value we need to find in the map.
        // This corresponds to `k - Ak` (with the +1 adjustment from the problem's interpretation).
        const   targetValue   =   k   +   1   -   a   ;

        if   (   map[targetValue]   )   // Check if the calculated target value exists as a key in our map.
        {
            // If it exists, add its frequency to our total count.
            // Each existing entry in the map represents a valid `Ai + i` part that matches `k - Ak`.
            count   +=   map[targetValue]   ;
        }
    }
)   ;


// Print the final calculated count to standard output.
console . log(   count   )   ;