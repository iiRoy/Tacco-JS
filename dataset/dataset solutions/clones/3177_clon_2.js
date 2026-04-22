"use strict"; /* Strict mode activated for cleaner code execution */
function ProcessData( rawInputData )
{
  // Split the raw input string by any whitespace characters
  rawInputData = rawInputData.split( /\s+/ );

  // Convert all string elements in the array to integers
  for ( let idx = 0 ; idx < rawInputData.length ; idx++ )
  {
    rawInputData[ idx ] = Number.parseInt( rawInputData[ idx ] , 10 ) ;
  }

  // Extract initial configuration values
  let countS = rawInputData.shift(); // Number of shrine locations
  let countT = rawInputData.shift(); // Number of temple locations
  let countQueries = rawInputData.shift(); // Number of query points

  // Populate shrine and temple arrays
  let shrines = rawInputData.splice( 0 , countS );
  let temples = rawInputData.splice( 0 , countT );

  // The remaining data are the query coordinates
  let queryCoordinates = rawInputData;

  // Sort queries while preserving their original indices
  let sortedQueries = sortAndIndex( queryCoordinates );

  // Arrays to store closest shrine/temple before and after each query point
  let shrinesBefore = [];
  let shrinesAfter = [];
  let templesBefore = [];
  let templesAfter = [];

  // Pointers for iterating through sorted shrine and temple lists
  let shrinePointer = 0;
  let templePointer = 0;

  // Pre-calculate nearest shrines and temples for each query
  for ( let idx = 0 ; idx < countQueries ; idx++ )
  {
    // Find the first shrine greater than or equal to the current query coordinate
    while ( shrines[ shrinePointer ] < sortedQueries[ idx ][ 0 ] )
    {
      shrinePointer++;
    }
    // Store the shrine before (or a very small number if none) and after (or a very large number)
    shrinesBefore[ idx ] = ( shrines[ shrinePointer - 1 ] || -1 * Number.MAX_SAFE_INTEGER );
    shrinesAfter[ idx ] = ( shrines[ shrinePointer ] || Number.MAX_SAFE_INTEGER );

    // Find the first temple greater than or equal to the current query coordinate
    while ( temples[ templePointer ] < sortedQueries[ idx ][ 0 ] )
    {
      templePointer++;
    }
    // Store the temple before (or a very small number if none) and after (or a very large number)
    templesBefore[ idx ] = ( temples[ templePointer - 1 ] || -1 * Number.MAX_VALUE );
    templesAfter[ idx ] = ( temples[ templePointer ] || Number.MAX_VALUE );
  }

  // Array to store the final results for each query
  let results = [];

  // Define a local reference for Math.abs to shorten calls
  const absoluteDifference = Math.abs;

  // Calculate the minimum travel distance for each query point
  for ( let idx = 0 ; idx < countQueries ; idx++ )
  {
    let originalIndex = sortedQueries[ idx ][ 1 ]; // Get the original index of the query
    let currentCoord = sortedQueries[ idx ][ 0 ]; // Get the query coordinate

    // Retrieve pre-calculated nearest locations
    let sPrev = shrinesBefore[ idx ];
    let sNext = shrinesAfter[ idx ];
    let tPrev = templesBefore[ idx ];
    let tNext = templesAfter[ idx ];

    // Determine the minimum distance by checking all 8 possible combinations of shrine/temple pairs
    results[ originalIndex ] = Math.min(
      absoluteDifference( sNext - currentCoord ) + absoluteDifference( tNext - sNext ),
      absoluteDifference( sNext - currentCoord ) + absoluteDifference( tPrev - sNext ),
      absoluteDifference( sPrev - currentCoord ) + absoluteDifference( tNext - sPrev ),
      absoluteDifference( sPrev - currentCoord ) + absoluteDifference( tPrev - sPrev ),
      absoluteDifference( tNext - currentCoord ) + absoluteDifference( sNext - tNext ),
      absoluteDifference( tNext - currentCoord ) + absoluteDifference( sPrev - tNext ),
      absoluteDifference( tPrev - currentCoord ) + absoluteDifference( sNext - tPrev ),
      absoluteDifference( tPrev - currentCoord ) + absoluteDifference( sPrev - tPrev )
    ).toString( 10 ); // Convert the minimum distance to a string
  }

  // Output the results, each on a new line, ensuring no trailing whitespace
  console.log( results.join( "\n" ).trim() + '\n' );
}

// Custom function to sort an array of numbers while keeping their original indices
function sortAndIndex( inputArray )
{
  let arrayLength = inputArray.length;
  // Initialize a new array with the first element and its index
  let indexedSortedArray = [ [ inputArray[ 0 ] , 0 ] ];

  // Iterate through the rest of the elements
  for ( let idx = 1 ; idx < arrayLength ; idx++ )
  {
    let upperBound = indexedSortedArray.length - 1; // Upper bound for binary search
    let lowerBound = 0; // Lower bound for binary search
    let midPoint = Math.floor( ( lowerBound + upperBound ) / 2 );

    // Perform binary search to find the correct insertion point
    while ( !( lowerBound > upperBound ) )
    {
      if ( indexedSortedArray[ midPoint ][ 0 ] < inputArray[ idx ] )
      {
        lowerBound = midPoint + 1;
      }
      else
      {
        upperBound = midPoint - 1;
      }
      midPoint = Math.floor( ( lowerBound + upperBound ) / 2 );
    }
    // Insert the current element and its original index into the sorted array
    indexedSortedArray.splice( midPoint + 1 , 0 , [ inputArray[ idx ] , idx ] );
  }
  return indexedSortedArray; // Return the sorted array with indices
}

// Read input from standard input and pass it to the main processing function
ProcessData( require( 'fs' ).readFileSync( "/dev/stdin" , "utf8" ) );