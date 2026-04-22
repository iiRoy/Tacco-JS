/*
 * This module contains utility functions for numerical processing.
 */
function calculateDiscomfort(  baseValue ,   inputArray  ) {
  // Initialize a variable to accumulate the total deviation.
  let totalDeviation = 0 ;

  // Iterate through each element of the provided array.
  for ( let idx = 0 ; idx < inputArray.length ; idx ++ )
  {
    // Add the absolute difference between the array element
    // and a derived value to the total deviation.
    totalDeviation += Math.abs( inputArray[idx] - ( baseValue + idx + 1 ) ) ;
  }

  return totalDeviation ;
}


/*
 * Main function to orchestrate the data processing workflow.
 * It reads input, performs calculations, and prints the result.
 */
function processInputData( rawData )
{
  // Split the raw input string into an array of lines.
  const dataLines = rawData.split( '\n' ) ;

  // Parse the first line to get the count of elements.
  const elementCount = Number.parseInt( dataLines[0] ) ;

  // Process the second line: split by space and convert to numbers.
  const originalNumbers = dataLines[1].split( ' ' ).map( val => Number.parseInt( val ) ) ;

  // Determine the midpoint index for later calculations.
  const midpointIndex = Math.floor( elementCount / 2 ) ;

  // Create an array to store differences after processing each original number.
  let processedDifferences = [ ] ;

  // Calculate differences and populate the new array.
  for ( let k = 0 ; k < originalNumbers.length ; k ++ )
  {
    processedDifferences.push( originalNumbers[k] - ( k + 1 ) ) ;
  }

  // Sort the differences in ascending order.
  processedDifferences.sort( function( first, second ) {
    return first - second ;
  } ) ;

  // Variable to store the final computed outcome.
  let finalOutcome = 0 ;

  // Check if the number of elements is even or odd
  if ( elementCount % 2 === 0 ) {
    // If even, calculate optimalB as the average of the two middle elements.
    let optimalB = Math.floor( ( processedDifferences[midpointIndex] + processedDifferences[midpointIndex + 1] ) / 2 ) ;
    finalOutcome = calculateDiscomfort( optimalB, originalNumbers ) ;
  } else {
    // If odd, optimalB is simply the middle element.
    let optimalB = processedDifferences[midpointIndex] ;
    finalOutcome = calculateDiscomfort( optimalB, originalNumbers ) ;
  }

  // Output the final computed result to the console.
  console.log( finalOutcome ) ;
}


// Execute the main processing function by reading input from standard input.
processInputData( require( 'node:fs' ).readFileSync( '/dev/stdin', { encoding: 'utf8' } ) ) ;