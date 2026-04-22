// This file solves the Travelling Plan problem.
// It calculates the total distance and then adjusts for each skipped node.
"use strict" ; // Enforce strict mode for cleaner code.

const DEBUG_MODE = false ; // Flag to enable or disable debug input.

// Determine the input source based on DEBUG_MODE.
const rawInput = DEBUG_MODE
  ? // Debug case: use a predefined string.
    "2\n1 19"
  : // Production case: read from standard input.
    require("fs")
      . readFileSync ( "/dev/stdin" ,  "utf8" ) // Read the file synchronously.
      . trim ( ) ; // Remove leading/trailing whitespace.

/**
 * Processes the raw input to calculate distances for the travelling plan.
 * @param {string} inputRaw - The raw input string containing node information.
 */
const process = ( inputRaw ) => {

  // Split the input into lines to separate node count and node values.
  const mainInputs = inputRaw . split ( "\n" ) ;

  // Parse the number of nodes from the first line.
  const nodeCount = parseInt ( mainInputs [ 0 ] ) ;

  // Prepare the array of nodes, padding with zeros at start and end
  // to simplify boundary calculations later.
  const paddedNodes = [
    0 , // Starting dummy node.
    ... mainInputs [ 1 ] // Second line contains node values.
          . split ( " " ) // Split by space to get individual node values.
          . map ( ( item ) => parseInt ( item ) ) , // Convert each value to an integer.
    0 // Ending dummy node.
  ] ;

  // Calculate the initial total distance without skipping any nodes.
  // This uses a reduction operation over the padded nodes array.
  const totalDistance = paddedNodes . reduce (
    ( acc ,  curr ,  index ) => { // Accumulator, current value, current index.
      // If it's the first element (dummy node), just return the accumulator.
      if ( index === 0 ) {
        return acc ;
      } else {
        // Otherwise, add the absolute difference between the current node
        // and the previous node to the accumulator.
        return acc + Math . abs ( curr - paddedNodes [ index - 1 ] ) ;
      }
    } ,
    0 // Initial value of the accumulator.
  ) ;


  // Iterate through each actual node (excluding the padding nodes)
  // to calculate the distance if that node were skipped.
  for ( let i = 1 ; i < nodeCount + 1 ; i ++ ) {

    // Get the node before the current node being considered for skipping.
    const previousNode = paddedNodes [ i - 1 ] ;

    // Get the current node that is being considered for skipping.
    const skippedNode = paddedNodes [ i ] ;

    // Get the node after the current node being considered for skipping.
    const nextNode = paddedNodes [ i + 1 ] ;


    // Calculate the distance segments that would be removed if 'skippedNode' is skipped.
    // This is the distance from previous to skipped, plus skipped to next.
    const distanceToSubtract =
        Math . abs ( skippedNode - previousNode )
      + Math . abs ( skippedNode - nextNode ) ;

    // Calculate the new distance segment that would be added if 'skippedNode' is skipped.
    // This is the direct distance from previous to next.
    const distanceToAdd = Math . abs ( previousNode - nextNode ) ;

    // Output the adjusted total distance.
    console . log ( totalDistance - distanceToSubtract + distanceToAdd ) ;
  }
} ;

// Execute the main processing function with the determined raw input.
process ( rawInput ) ;