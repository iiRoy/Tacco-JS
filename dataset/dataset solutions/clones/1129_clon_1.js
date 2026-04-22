/*
 * This file processes input from standard input, performs a dynamic
 * programming calculation, and then prints the result to the console.
 * It uses Node.js specific features like `require` and `process.nextTick`.
 */

// Import the 'fs' module for file system operations.
const   input = require ( 'fs' )
                      . readFileSync ( '/dev/stdin' ,
                                      'utf8'         ) ;

// The 'util' module is imported, though not explicitly used in the provided snippet.
const   util = require( 'util' ) ;

/**
 * Creates a Promise that resolves on the next tick of the Node.js event loop.
 * This can be used to yield control and prevent call stack overflow in
 * deeply recursive or long-running synchronous operations.
 *
 * @returns {Promise<any>} A Promise that resolves after `process.nextTick`.
 */
const   nextTick = ( ) =>
{
  return new   Promise ( ( resolve , reject ) =>
  {
      // Schedule a callback to be executed on the next turn of the event loop.
      process . nextTick ( ( err , result ) =>
      {
          // If an error occurred during the next tick, reject the promise.
          if ( err )
          {
              reject ( err ) ;
              return ; // Exit the callback
          }
          // Otherwise, resolve the promise with the result (which is usually undefined for nextTick).
          resolve ( result ) ;
      } ) ;
  } ) ;
} ;



// Read the input string, remove leading/trailing whitespace, and split it by newlines.
const   list = input . trim ( ) . split ( '\n' ) ;

// Parse the first line of input to get two numbers, n and m.
// Destructure the array returned by map into variables 'n' and 'm'.
let     [   n ,   m   ] = list [ 0 ] . split ( ' ' ) . map ( Number ) ;

// Parse the second line of input to get an array of numbers, cm.
// These represent the costs or values for the dynamic programming problem.
let     cm = list [ 1 ] . trim ( ) . split ( ' ' ) . map ( Number ) ;


// Initialize a counter to track recursive calls.
// This is used to prevent stack overflow by yielding control periodically.
let     callCount = 0 ;

// Initialize a 2D array (m rows, n columns) for memoization (dynamic programming table).
// dp[i][x] will store the minimum cost to achieve sum 'x' using items up to index 'i'.
// It's initialized with 'undefined' implicitly, then filled with 'n' (a placeholder value).
// The outer array has 'm' elements, and each inner array has 'n' elements.
const   dp = ( new Array ( m ) ) . fill ( n ) . map ( ( nVal ) => new Array ( n ) ) ;


/**
 * Solves the problem using dynamic programming with memoization and
 * an async yield mechanism to prevent stack overflow on deep recursion.
 *
 * The problem appears to be a variation of the unbounded knapsack or
 * change-making problem where we want to find the minimum number of
 * items (or operations) to reach a target sum 'x' using costs 'cm[i]'.
 *
 * @param {number} i - The current index in the 'cm' array (item to consider).
 * @param {number} x - The remaining target sum to achieve.
 * @returns {Promise<number>} The minimum count of items needed to reach 'x'.
 */
const   solve = async ( i ,   x ) =>
{
    // Increment the call counter for stack overflow prevention.
    if ( ++ callCount > 1000000 )
    {
        // If call count exceeds a threshold, yield control to the event loop.
        // console.log ( 'nextTick: start: ' + callCount ) ; // Original commented line
        await   nextTick ( ) ; // Asynchronously wait for the next tick.
        callCount = 0 ; // Reset the call counter after yielding.
        // console.log ( 'nextTick: end: ' + callCount ) ;   // Original commented line
    }

    // Base case 1: If all items have been considered.
    if ( i === cm . length )
    {
        // If the target sum 'x' is 0, we need 0 items.
        // Otherwise, it's impossible to reach 'x' with remaining items, so return 'n' (a large value).
        return x === 0   ?   0   :   n ;
    }

    // Base case 2: If this subproblem has already been solved, return the memoized result.
    if ( dp [ i ] [ x ] !== undefined )
    {
        return dp [ i ] [ x ] ;
    }


    // Recursive step:
    // Option 1: Do not include the current item cm[i].
    // Move to the next item (i + 1) with the same target sum 'x'.
    let     result = await   solve ( i + 1 ,   x ) ;

    // Option 2: If the current item cm[i] can be included (i.e., x >= cm[i]).
    if ( x >= cm [ i ] )
    {
        // Include the current item:
        //   - Take 1 item (the current cm[i]).
        //   - Recursively solve for the remaining target sum (x - cm[i]) using the same item (i).
        //   - Compare this result with the result from Option 1 and take the minimum.
        result = Math . min ( result ,   await   solve ( i ,   x - cm [ i ] )   +   1 ) ;
    }

    // Memoize the result for the current subproblem (i, x) before returning.
    return dp [ i ] [ x ] = result ;
} ;


/*
 * Self-invoking asynchronous function to start the computation.
 * This is the main execution block of the script.
 */
( async ( ) =>
{
    // Call the solve function with initial parameters (start from item 0, target sum 'n').
    // Await the result and then print it to the console.
    console . log ( await   solve ( 0 ,   n ) ) ;
} ) ( ) ;