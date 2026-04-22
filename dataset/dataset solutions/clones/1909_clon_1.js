"use strict" ; /* Enable strict mode for cleaner code */

// This section handles file input and initial data parsing.
const input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; // Read input synchronously from standard input
const rows = input. trim ( ). split ( "\n" ) ; // Trim whitespace and split into an array of lines


// Parse the header row to get essential parameters.
const header = rows.shift ( ) . trim ( ) . split ( " " ) . map ( Number ) ; /* Extract the first row,
                                                                          trim it, split by space,
                                                                          and convert elements to numbers */

// Assign values from the header to named constants for clarity.
const N = header [ 0 ] ; // Total number of operations to perform
const A = header [ 1 ] ; // Initial count for resource A
const B = header [ 2 ] ; // Initial count for resource B
const C = header [ 3 ] ; // Initial count for resource C


/* Initialize a queue-like structure (using an array as a stack for simplicity,
   as we pop from the end). */
const queList = [ ] ;

// Add the initial state to the queue.
queList . push ( { A , B , C , result : [ ] } ) ; // The 'result' array tracks the sequence of operations


let resultQue ; /* This variable will hold the final successful state
                   if a solution is found. */


/* Main loop: continues as long as there are states to explore in the queue. */
while ( queList . length )
{
  const que = queList . pop ( ) ; // Get the last state from the queue for processing

  /* Check if the current state has reached the target number of operations. */
  if ( que . result . length >= N )
  {
    resultQue = que ; // Store this successful state
    break ; // Exit the loop as a solution is found
  }


  // Retrieve the current operation rule from the input rows.
  const row = rows [ que . result . length ] ; // The index corresponds to the number of operations already performed

  /*
   *   Explore the first possible operation: decrementing row[0] and incrementing row[1].
   *   This is only possible if resource row[0] has a positive count.
   */
  if ( que [ row [ 0 ] ] > 0 )
  {
    // Create a new state based on the current one to avoid modifying it directly.
    const newQue = Object . create ( que ) ;

    newQue [ row [ 0 ] ] -= 1 ; // Decrement resource row[0]
    newQue [ row [ 1 ] ] += 1 ; // Increment resource row[1]
    // Record the operation performed (which resource was incremented).
    newQue . result = que . result . concat ( [ row [ 1 ] ] ) ;

    queList . push ( newQue ) ; // Add the new state to the queue for future exploration
  }

  /*
   *   Explore the second possible operation: decrementing row[1] and incrementing row[0].
   *   This is only possible if resource row[1] has a positive count.
   */
  if ( que [ row [ 1 ] ] > 0 )
  {
    // Again, create a new state to maintain the integrity of the original 'que'.
    const newQue = Object . create ( que ) ;

    newQue [ row [ 0 ] ] += 1 ; // Increment resource row[0]
    newQue [ row [ 1 ] ] -= 1 ; // Decrement resource row[1]
    // Record the operation (which resource was incremented in this case).
    newQue . result = que . result . concat ( [ row [ 1 ] ] ) ;

    queList . push ( newQue ) ; // Add this alternative new state to the queue
  }
}


// After the loop, check if a solution was found.
if ( resultQue )
{
  console. log ( "Yes" ) ; // Output "Yes" if a valid sequence of operations was found
  // Print the sequence of operations, each on a new line.
  console . log ( resultQue . result . join ( "\n" ) ) ;
}
else
{
  console . log ( "No" ) ; // Output "No" if no solution was found
}