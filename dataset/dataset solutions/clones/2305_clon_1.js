/*
 * This is a Type I clone generated from an existing JavaScript codebase.
 * The core logic and structure remain absolutely identical to the original.
 * Only whitespace and comments have been altered to demonstrate Type I cloning.
 */


/**
 * Processes the input data to calculate a specific answer.
 * @param {number[][]} input - A two-dimensional array of numbers as input.
 *                             The first row contains M at index 1.
 *                             The second row contains a list of numbers to be sorted.
 */
function         Main(  input  )
{


  // Retrieve the value of M from the input array.
  const   M   =   input   [  0  ]   [  1  ]   ;


  // Sort the second row of the input array in descending order.
  const   alist   =   input   [  1  ]   .   sort   (   (  a1  ,   a2  )   =>   a2   -   a1   )   ;


  /*
   * Initialize kumiVals. Each element is an array containing
   * the original value doubled. This array will be extended later.
   * Conceptually, this prepares for combinations.
   */
  const   kumiVals   =   alist   .   map   (   (  ai  )   =>   [  ai   *   2  ]   )   ;


  // Declare variables used throughout the main loop.
  // 'answer' accumulates the total sum.
  // 'i' is the loop counter.
  // 'x', 'y' are indices for accessing kumiVals.
  // 'kumiVal' temporarily holds an element from kumiVals.
  // 'carry' holds a value to be added in the next iteration.
  // 'maxX', 'maxY' store the indices of the maximum value found.
  // 'val' is a temporary variable for comparing values.
  var   answer   =   0   ;
  var   i   ,   x   ,   y   ,   kumiVal   ,   carry   =   null   ,   maxX   ,   val   ;


  // Main loop iterates M times to process combinations.
  for   (   i   =   0   ;   i   <   M   ;   i++   )
  {
    // Check if there's a carried-over value from the previous iteration.
    if   (   carry   )
    {
      // If a carry exists, add it to the answer and reset carry.
      answer   +=   carry   ;
      carry   =   null   ;
      continue   ;   // Skip the rest of the current iteration.
    }


    // Initialize variables for finding the maximum value in kumiVals.
    // Assume the first element (index 0) of kumiVals holds the current maximum.
    maxX   =   0   ;
    maxY   =   kumiVals   [  maxX  ]   .   length   -   1   ;
    max   =   kumiVals   [  maxX  ]   [  maxY  ]   ;


    // Loop through the kumiVals array (excluding the first element which is 0)
    // to find the maximum value among the last elements of each sub-array.
    for   (   x   =   1   ;   x   <   kumiVals   [  0  ]   .   length   -   1   ;   x++   )
    {
      kumiVal   =   kumiVals   [  x  ]   ;             // Get the current sub-array.
      y   =   kumiVal   .   length   -   1   ;         // Get the index of its last element.
      val   =   kumiVal   [  y  ]   ;                 // Get the last element's value.


      // If the current value is greater than the current maximum, update max and its indices.
      if   (   val   >   max   )
      {
        maxX   =   x   ;
        maxY   =   y   ;
        max   =   val   ;
      }
    }


    // Add the found maximum value to the total answer.
    answer   +=   max   ;


    // If the maximum value came from a combination (i.e., not the initial doubled value),
    // then this value needs to be carried over to the next iteration.
    if   (   maxY   >   0   )
    {
      // Set 'carry' to the current maximum value for the next loop iteration.
      carry   =   max   ;
    }


    // Prepare for the next combination by pushing a new value into the kumiVals array
    // at the index where the maximum was found.
    // The new value is either a sum of two alist elements or 0 if out of bounds.
    kumiVals   [  maxX  ]   .   push   (   alist   [  maxY   +   1  ]   ?   (  alist   [  maxX  ]   +   alist   [  maxX   +   maxY   +   1  ]  )   :   0   )   ;
  }


  // Output the final calculated answer to the console.
  console   .   log   (  answer  )   ;
}


// --- Execution Entry Point ---
// Reads input from standard input, processes it, and calls the Main function.
Main   (
  require   (  "fs"  )   .   readFileSync   (  "/dev/stdin"  ,   "utf8"  )   .   trim   (  )
    .   split   (  '\n'  )
    .   map   (   (  line  )   =>   line   .   split   (  ' '  )   .   map   (  Number  )   )
)   ;