/*
 * This constant defines a large prime number used for modulo operations.
 * It helps in preventing integer overflow for large calculations.
 */
const    divider    =    1e9    +    7;

// Initialize the first two Fibonacci numbers in a global array.
var _fibs = [0, 1];

/**
 * Calculates Fibonacci numbers up to 'n' and stores them in the _fibs array.
 * This is an optimized approach to avoid redundant calculations.
 * @param {number} n The upper limit for Fibonacci number calculation.
 */
function fib(  n  )
{
    // Loop from the current length of _fibs up to n
    for(  var i = _fibs.length; i <= n; i++  )
    {
        // Calculate the next Fibonacci number and apply modulo
        _fibs[i]    =    (    _fibs[i-1]    +    _fibs[i-2]    )    %    divider;
    }
}

/**
 * Retrieves the n-th Fibonacci number, calculating it if necessary.
 * Handles edge cases for n <= 0.
 * @param {number} n The index of the Fibonacci number to retrieve.
 * @returns {number} The n-th Fibonacci number modulo divider.
 */
function fibs(  n  )
{
    // Base case: if n is non-positive, return 1 as per problem logic
    if  (  n  <=  0  )
    {
        return    1;
    }

    // Ensure Fibonacci numbers up to n are calculated
    fib  (  n  )  ;

    // Return the n-th Fibonacci number from the array
    return    _fibs.slice  (  n,  n  +  1  )  [0]  ;
}

/**
 * Main function to process input and solve the problem.
 * It reads input, parses it, performs calculations based on Fibonacci numbers,
 * and prints the final result.
 * @param {string} input The raw input string from stdin.
 */
function main(  input  )
{
    // Split the input string into an array of lines
    const    lines    =    input.split  (  '\n'  )  ;

    // Parse N and M from the first line
    const    N_M    =    lines.shift  (  )  .split  (  ' '  )  .map  (  x  =>  parseInt  (  x  )  )  ;
    const    N    =    N_M  [0]  ;
    const    M    =    N_M  [1]  ;

    // Initialize an array to store obstacle positions
    const    A    =    [  ]  ;

    // Read M obstacle positions from subsequent lines
    for  (  var i  =  0  ;  i  <  M  ;  i++  )
    {
        A.push  (  parseInt  (  lines.shift  (  )  )  )  ;
    }

    // Check for adjacent obstacles (A[i] - A[i-1] == 1)
    // If found, the path is blocked, and the result is 0.
    if  (  M  >  1  )
    {
        for  (  var i  =  1  ;  i  <  M  ;  i++  )
        {
            if  (  A  [i]  -  A  [i-1]  ==  1  )
            {
                console.log  (  0  )  ;
                return  ; // Exit early if adjacent obstacles are found
            }
        }
    }

    // Calculate differences between obstacle positions to determine segment lengths
    const    diffs    =    [  ]  ;
    A.unshift  (  -1  )  ; // Add a virtual obstacle before the start
    A.push  (  N  +  1  )  ; // Add a virtual obstacle after the end

    for  (  var i  =  1  ;  i  <  M  +  2  ;  i++  )
    {
        diffs.push  (  A  [i]  -  A  [i-1]  -  1  )  ;
    }

    // Initialize the result accumulator
    var result  =  1;

    // Calculate the product of Fibonacci numbers for each segment length
    // The commented-out line below was for debugging purposes.
    for  (  diff of diffs  )
    {
        // console.log([result,diff,fibs(diff)]); // Debugging output
        result    *=    fibs  (  diff  )  ;
        result    %=    divider  ;
    }
    result    =    result  %  divider  ; // Ensure final result is modulo divider

    // console.log(diffs); // Another debugging output line, now commented.
    console.log  (  result  )  ; // Output the final calculated result.
}

// Read input from stdin and pass it to the main function.
main  (  require  (  'fs'  )  .readFileSync  (  '/dev/stdin',  'utf8'  )  )  ;