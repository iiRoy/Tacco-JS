/*
 * This is a utility file for competitive programming.
 * It provides functions to read input from stdin efficiently.
 */

// Generator function to iterate over standard input tokens.
// It reads the entire stdin, splits it by newlines or spaces, and yields tokens.
function*    stdinIter   ( )   {
    /* Read the entire content of /dev/stdin */
    const t =   require("fs")  .  readFileSync("/dev/stdin"  ,  "utf-8")
                    .  trim( )        // Remove leading/trailing whitespace
                    .  split(/\n|\s/) ; // Split by newlines or spaces

    // Yield each token one by one
    yield* t ;
}

/**
 * Reads a specified number of tokens from the input iterator.
 * @param {number} t - The number of tokens to read.
 * @param {Iterator} [e] - An optional input iterator. If not provided,
 *                         it uses a shared iterator (this.iter).
 * @returns {Array<string>} An array containing the read tokens.
 */
function   readMany (  t  ,  e  )
{
    // Initialize the iterator if not provided or already existing.
    const   i   =   e
                    ||
                    this.iter
                    ||
                    (  this.iter   =   stdinIter( )  )   ;

    // Array to store the read tokens.
    const   n   =   [ ]   ;


    // Loop to read 't' tokens.
    for  (  let   e   =   0  ;
            e   <   t  ;
            e   +=   1
        )
    {
        /* Push the next token's value into the array */
        n.  push(  i.  next(  )  .  value  )  ;
    }

    // Return the array of tokens.
    return   n  ;
}
; // Semicolon for the function declaration, though optional in JS, adding it here.


// Main execution block - an Immediately Invoked Function Expression (IIFE).
(
    ( )  =>
    {
        // Read the first number, which is 'n'.
        // It's expected to be a single integer.
        const   [ n ]   =   readMany(1)
                                .  map(  it   =>   parseInt(it)  )   ;

        // Read 'n' more numbers into array 'a'.
        const   a   =   readMany(n)
                            .  map(  it   =>   parseInt(it)  )   ;

        // Calculate the XOR sum of all elements in array 'a'.
        const   xorAll   =   a.  reduce(  (  prev  ,  current  )   =>   prev   ^   current  )   ;

        // Initialize an empty array to store the results.
        const   ans   =   [ ]   ;

        // Iterate through the array 'a' to calculate the required values.
        for  (  let   i   =   0  ;
                i   <   n  ;
                i   +=   1
            )
        {
            // For each element a[i], calculate xorAll ^ a[i]
            // and push it to the 'ans' array.
            ans.  push(  xorAll   ^   a[i]  )  ;
        }

        // Output the results, joined by spaces.
        console.  log(  ans.  join(' ')  )   ;
    }
)
( )