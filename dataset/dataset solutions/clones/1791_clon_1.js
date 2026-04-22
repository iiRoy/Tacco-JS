// This JavaScript program processes input to determine a specific outcome.
// It reads several numerical values and performs calculations and conditional checks.

const input = require("fs").readFileSync("/dev/stdin", "utf8") ; // Read the entire input from standard input.


let   cin = input.split(/ |\n/), cid = 0 ; // Split the input string by spaces or newlines into an array of tokens.
                                            // 'cid' acts as an index for the current token.


/*
 *  Helper function: next()
 *  Retrieves the next token from the 'cin' array.
 */
const next = () => cin[cid++] ;


/*
 *  Helper function: nexts(n)
 *  Retrieves the next 'n' tokens from 'cin',
 *  increments the current index, and parses each token as an integer.
 */
const nexts = (n) => cin.slice(cid, cid+=n).map(i=>parseInt(i)) ;


// Destructure the first five parsed integer values from the input.
// These represent A, V, B, W, and T respectively.
const [ A, V, B, W, T ] = nexts(5) ;


// Initialize a boolean flag. This flag will be used to track if a specific condition is met.
isSamePos = false ;


// Begin a loop that iterates 'T' times.
// The loop variable 'i' represents a point in time from 0 up to T-1.
for ( let i = 0 ; i < T ; i++ ) {

    // Check if the calculated position of entity A (A + V * i) is equal to
    // the calculated position of entity A *again* (A + W * i).
    // Note: This condition simplifies to V * i == W * i.
    if ( A + V * i == A + W * i ) {

        isSamePos = true ; // If the condition holds true, set the flag.
    }
}


// After the loop, if the 'isSamePos' flag is still false (meaning the condition was never met),
// then print 'NO' to the console and terminate the program immediately.
if ( !isSamePos ) return console.log('NO') ;


/*
 *  Perform the final comparison.
 *  Calculate the position of entity A after time T: A + V * T.
 *  Calculate the position of entity B after time T: B + W * T.
 *  Check if A's final position is greater than or equal to B's final position.
 */
if ( A + V * T >= B + W * T ) {

    console.log('YES') ; // If A is ahead or at the same position as B, print 'YES'.

} else {

    console.log('NO') ; // Otherwise, if B is ahead of A, print 'NO'.
}

// End of the program.