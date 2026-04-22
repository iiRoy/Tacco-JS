/*
 * This section of the code handles input data acquisition.
 * The commented-out line below would typically read from standard input
 * in a production environment, but for testing purposes,
 * a hardcoded string is used instead.
 */
// const input = require("fs").readFileSync("/dev/stdin", "utf8")

var input = `5 2
2 4 5 1 3
3 4 -10 -8 8`

/*
 * The following commented-out blocks represent alternative test cases
 * that could be used for validating the program's logic.
 *
 * var input = `2 6
 * 2 1
 * 10 -7`
 *
 * var input = `3 3
 * 3 1 2
 * -1000 -2000 -3000`
 *
 */



// This is the active input string used for the current execution.
var input = `10 58
9 1 6 7 8 4 3 2 10 5
695279662 988782657 -119067776 382975538 -151885171 -177220596 -169777795 37619092 389386780 980092719`



/*
 * Processing the raw input string:
 *   1. Split into individual lines.
 *   2. Parse numerical parameters N and K.
 *   3. Parse arrays P and C.
 */
const lines = input . split ( '\n' ) ;

let [ N , K ] = lines [ 0 ] . split ( ' ' ) . map ( Number ) ;

const P = lines [ 1 ] . split ( ' ' ) . map ( Number ) ;
const C = lines [ 2 ] . split ( ' ' ) . map ( Number ) ;


// Prepend 'null' to P and C arrays to make them 1-indexed,
// aligning with problem statement or common algorithmic patterns.
P . unshift ( null ) ;

C . unshift ( null ) ;



/**
 * This function calculates the maximum possible score achievable
 * starting from a given position 'start' and making 'K' moves.
 * It handles scenarios involving loops in the path.
 *
 * @param {number} start - The starting position (1-indexed).
 * @returns {number} The maximum score.
 */
const f = ( start ) => {

    const route = {} ; // Tracks visited nodes in the current path.
    let i = start ;    // Current position in the path.
    let sum = 0 ;      // Accumulator for scores along the path.
    let peak = -1000000000 ; // Stores the maximum score encountered so far.
    let loop = false ; // Flag to detect if a loop has been entered.
    let k = 0 ;        // Counter for moves made.

    // Simulate K moves to find the initial path and detect loops.
    for ( k ; k < K ; k ++ ) {
        route [ i ] = true ; // Mark current node as visited.
        i = P [ i ] ;        // Move to the next node according to P.
        sum += C [ i ] ;     // Add the score of the new node.
        peak = Math . max ( peak , sum ) ; // Update the maximum score.

        // If the next node is already in the route, a loop is detected.
        if ( route [ i ] ) {
            loop = true ;
            break ; // Exit the loop early.
        }
    }

    // Scenario 1: No loop detected within K moves.
    // In this case, simply return the highest score found.
    if ( ! loop ) {
        return peak ;
    }

    // Scenario 2: A loop was detected.
    // If the total sum of scores within the detected loop is negative,
    // it's always better to avoid traversing the loop multiple times.
    // So, we return the peak score achieved before or within the first loop traversal.
    if ( sum < 0 ) {
        return peak ;
    }

    // Scenario 3: A loop was detected, and its sum is non-negative (0 or positive).
    // This implies that traversing the loop multiple times might increase the score.

    // Calculate how many full loop traversals can be made.
    // 'k + 1' represents the length of the detected loop.
    const times = K % ( k + 1 )
        ? Math . floor ( K / ( k + 1 ) ) // If K is not a multiple of loop length, we can do floor(K/loop_len) full loops.
        : K / ( k + 1 ) - 1 ;          // If K is a multiple, we do K/loop_len - 1 full loops to account for the last partial traversal.

    // Reset variables for calculating the score of the remaining moves after full loops.
    i = start ;     // Reset current position to the start.
    _sum = 0 ;      // Accumulator for scores in the partial traversal.
    _peak = -1000000000 ; // Max score in the partial traversal.
    _K = K % ( k + 1 ) ; // Number of remaining moves after full loop traversals.
    k = 0 ;         // Reset loop counter.

    // Simulate the remaining partial moves.
    for ( k ; k < _K ; k ++ ) {
        i = P [ i ] ;       // Move to the next node.
        _sum += C [ i ] ;   // Add score.
        _peak = Math . max ( _peak , _sum ) ; // Update peak for this partial segment.
    }

    // Calculate the final answer by considering two options:
    // 1. (times - 1) full loops + the peak score from the initial path (which includes one loop traversal).
    // 2. (times) full loops + the peak score from the partial remaining moves (_peak).
    // We choose the maximum of these two strategies.
    return Math . max ( sum * ( times - 1 ) + peak , sum * times + _peak ) ;
} ;


// Initialize the overall maximum answer to a very small number.
let ans = -1000000000 ;

// Iterate through all possible starting positions from 1 to N.
for ( let start = 1 ; start <= N ; start ++ ) {
    // For each starting position, calculate the maximum score
    // and update the overall answer if a higher score is found.
    ans = Math . max ( ans , f ( start ) ) ;
}

// Output the final maximum score found.
console . log ( ans ) ;

/*
 * Note: The problem implies that at least one move is always executed,
 * and scores (C[i]) can be negative, which influences the logic
 * for handling loops and peak score calculation.
 */