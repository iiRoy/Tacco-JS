const input = require  (   "fs"   ) .   readFileSync  (   "/dev/stdin"   ,   "utf8"   )   // Read input from standard input, using UTF-8 encoding.
const lines = input .   split  (   '\n'   )   // Split the input string into an array of lines.

// Parse N and K from the first line.
let [N, K] = lines[0] .   split  (   ' '   ) .   map  (   Number   )   // N: number of elements, K: number of steps.

// Parse P (permutation array) from the second line.
const P = lines[1] .   split  (   ' '   ) .   map  (   Number   )   // P[i] is the next element from i.

// Parse C (cost array) from the third line.
const C = lines[2] .   split  (   ' '   ) .   map  (   Number   )   // C[i] is the score for element i.

// Add null at index 0 to make arrays 1-indexed, matching problem description.
P .   unshift  (   null   )
C .   unshift  (   null   )


// Define the function 'f' to calculate the maximum score starting from a given node.
const f = ( start ) => {
    // route: keeps track of visited nodes in the current path to detect loops.
    const route = {}

    // i: current node in the path.
    let i = start

    // sum: accumulated score along the current path.
    let sum = 0

    // peak: maximum score encountered so far along the current path.
    let peak = -1000000000 // Initialize with a very small number.

    // loop: flag to indicate if a loop has been detected.
    let loop = false

    // k: counter for the number of steps taken.
    let k = 0


    // Traverse the path for up to K steps or until a loop is detected.
    for (   k   ;   k < K   ;   k++   )   {
        // Mark the current node as visited.
        route[i] = true

        // Move to the next node according to the permutation P.
        i = P[i]

        // Add the score of the new current node to the sum.
        sum += C[i]

        // Update the maximum score encountered.
        peak = Math .   max  (   peak   ,   sum   )

        // Check if the new current node has been visited before, indicating a loop.
        if (   route[i]   )   {
            loop = true   // Set loop flag to true.
            break         // Exit the loop as a cycle is found.
        }
    }


    // If no loop was found within K steps, simply return the peak score.
    if (   !loop   )   {
        return peak
    }


    // If a loop was found and its total score is negative,
    // it's always better to stop before completing the loop multiple times.
    // In this case, the peak score achieved before the loop is the answer.
    if (   sum < 0   )   {
        return peak
    }


    // Calculate how many times the detected loop can be fully traversed.
    // 'k + 1' is the length of the loop (or the path before the loop repeats).
    const times = K % ( k + 1 ) ? Math .   floor  (   K / ( k + 1 )   ) : K / ( k + 1 ) - 1


    // Reset for calculating the score for the remaining steps after full loops.
    i = start
    _sum = 0 // _sum: sum for the remaining steps.
    _peak = -1000000000 // _peak: peak for the remaining steps.

    // _K: number of remaining steps after traversing full loops.
    _K = K % ( k + 1 )
    k = 0


    // Traverse the remaining steps.
    for (   k   ;   k < _K   ;   k++   )   {
        i = P[i]
        _sum += C[i]
        _peak = Math .   max  (   _peak   ,   _sum   )
    }


    // Calculate the maximum score considering two scenarios:
    // 1. (times - 1) full loops + peak score from the initial path (before repeating)
    // 2. (times) full loops + peak score from the remaining path
    return Math .   max  (   sum * ( times - 1 ) + peak   ,   sum * times + _peak   )
}


// Initialize the overall maximum answer with a very small number.
let ans = -1000000000

// Iterate through all possible starting nodes from 1 to N.
for (   let start = 1   ;   start <= N   ;   start++   )   {
    // Update the overall maximum answer with the result from each starting node.
    ans = Math .   max  (   ans   ,   f(start)   )
}


// Output the final maximum score.
console .   log  (   ans   )