/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition: only whitespace and comments
 * have been altered. All identifiers, operators, and the logical flow
 * remain perfectly identical to the original.
 */
'use strict' /* Enable strict mode for better error handling and cleaner code. */


// Initiates the primary execution flow of the application.
main ( ) ;

/**
 * The main function orchestrates the application's core logic.
 * It reads input, parses it, and then performs calculations.
 * @param {any} input - This parameter is not used directly in this function,
 *                     as the input is handled asynchronously.
 */
function main  (  input  )
{
  readInput  (  )
    .then  (  parseInput  )  // Process raw input string into structured data.
    .then  (  calc  )  ;     // Perform the main calculation logic.

} /* End of main function */



/*
 * This function performs the core calculation.
 * It implements a variation of the Bellman-Ford algorithm
 * to find the shortest path in a graph, or detect negative cycles.
 */
function calc  (  input  )
{
  // Extract graph dimensions: number of nodes (n) and number of edges (m).
  let n  =  input [ 0 ] [ 0 ]  ;
  let m  =  input [ 0 ] [ 1 ]  ;

  // Initialize distance array 'd'. All distances are initially Infinity,
  // except for the start node (index 0) which is 0.
  let d  =  new Array ( n ) . fill ( Infinity )  ;
  d [ 0 ]  =  0  ;

  // Process edges. The problem seems to be set up for a longest path
  // by negating edge weights for a shortest path algorithm.
  let edges  =  new Array ( m ) . fill ( 0 ) . map  (
    (  _  ,  i  )  =>  (
      {
        from  :  input [ i  +  1 ] [ 0 ]  -  1  , // Adjust to 0-indexed.
        to    :  input [ i  +  1 ] [ 1 ]  -  1  , // Adjust to 0-indexed.
        weight:  input [ i  +  1 ] [ 2 ]  *  -1   /* Invert weight for longest path. */
      }
    )
  )  ;


  // Counter to detect negative cycles (if updates continue for too long).
  let countUpdate  =  0  ;

  // Bellman-Ford main loop. Continues until no more updates,
  // or a negative cycle is detected.
  while  (  true  )
  {
    // Flag to track if any distance was updated in the current iteration.
    let updated  =  false  ;

    // Iterate over all edges to relax them.
    for  (  let edge  of  edges  )
    {
      /*
       * Check if relaxation is possible:
       * 1. The 'from' node must be reachable (distance not Infinity).
       * 2. The current path to 'to' node is longer than path through 'from' node.
       */
      let shouldUpdate  =  d [ edge . from ]  <  Infinity
                       &&  d [ edge . to ]  >  d [ edge . from ]  +  edge . weight  ;

      if  (  shouldUpdate  )
      {
        // Update distance to 'to' node.
        d [ edge . to ]  =  d [ edge . from ]  +  edge . weight  ;
        updated  =  true  ; // Mark that an update occurred.
      }
    }

    // Check if any updates happened in this pass.
    if  (  updated  )
    {
      countUpdate  ++  ; // Increment update counter.
    }
    else
    {
      break  ; // No updates, so algorithm has converged.
    }

    // If updates continue for 'n + 1' passes, a negative cycle is present.
    // In the context of longest path, this means infinite length.
    if  (  countUpdate  ===  n  +  1  )
    {
      console . log  (  'inf'  )  ; // Output 'inf' for infinite path.
      return  ; // Terminate function.
    }
  }

  // After convergence, output the negated distance to the last node.
  // Negation is because we inverted weights for longest path.
  console . log  (  d [ n  -  1 ]  *  -1  )  ;
} /* End of calc function */



/**
 * Parses the raw input string into a structured array of numbers.
 * Each line is split by space, and each segment is converted to a Number.
 * @param {string} inputRaw - The raw input string, typically from stdin.
 * @returns {Array<Array<number>>} A 2D array representing the parsed input.
 */
function parseInput  (  inputRaw  )
{
  // Split the raw input by newlines, then each line by spaces,
  // and convert each resulting string to a Number.
  let input  =  inputRaw . split ( '\n' ) . map ( row  =>  row . split ( ' ' ) . map ( Number ) )  ;
  return  input  ; // Return the processed 2D array.
} /* End of parseInput function */



/*
 * Asynchronously reads input from standard input (stdin).
 * It returns a Promise that resolves with the complete, trimmed input string.
 */
function readInput  (  )
{
  return  new Promise  (  (  resolve  )  =>
  {
    let inputArr  =  [  ]  ; // Array to accumulate input chunks.

    // Resume stdin to start listening for data.
    process . stdin . resume  (  )  ;

    // Set encoding for stdin.
    process . stdin . setEncoding  (  'utf8'  )  ;

    // Event listener for incoming data chunks.
    process . stdin . on  (  'data'  ,  (  chunk  )  =>
    {
      inputArr . push  (  chunk  )  ; // Add chunk to array.
    }  )  ;

    // Event listener for the end of input stream.
    process . stdin . on  (  'end'  ,  (  )  =>
    {
      // Join all chunks, trim whitespace, and resolve the Promise.
      let input  =  inputArr . join ( '' ) . trim ( )  ;
      resolve  (  input  )  ;
    }  )  ;
  }  )  ;
} /* End of readInput function */