'use strict'

// This function processes the incoming raw text data to find dimensions for a rectangle.
function ProcessInputData( rawText ) {


  // Split the entire input content into an array, where each element is a line.
  const linesArray = rawText .split( '\n' );

  // From the second line (index 1), split by spaces, then sort lexicographically, and finally reverse the order.
  // This prepares an array of potential dimension strings, ordered in a specific (non-numeric) way.
  const dimensionStrings = linesArray[1] .split( ' ' ) .sort() .reverse();


  // Initialize an array to store the two dimensions that will form the rectangle.
  const rectangleDimensions = [];


  // A variable to keep track of the last processed dimension string to prevent redundant processing of duplicates.
  let lastEncounteredValue = 0; // Initially a number, but will quickly become a string.


  // Loop through each individual dimension string in the prepared list.
  for ( let currentDimension of dimensionStrings ) {


    // If the current dimension is identical to the one we just processed, skip it to avoid re-counting.
    if ( currentDimension === lastEncounteredValue )
      continue;


    // Update our tracker with the new unique dimension string.
    lastEncounteredValue = currentDimension;


    // Count how many times this specific dimension string appears in the full list of dimensions.
    const countOfOccurrences = dimensionStrings.filter( ( dimensionItem ) => currentDimension === dimensionItem ).length;


    // Check if we have at least four instances of the current dimension.
    if ( countOfOccurrences >= 4 ) {

      // If so, we found two pairs, which means we can use this dimension twice for a square.
      rectangleDimensions .push( currentDimension );
      rectangleDimensions .push( currentDimension );
      break; // We have found our two required dimensions, so terminate the search.

    }
    // Otherwise, check for at least two instances of the dimension.
    // The condition (countOfOccurrences != 1 || countOfOccurrences != 3) is always true when countOfOccurrences is >= 2.
    else if ( countOfOccurrences >= 2 && ( countOfOccurrences != 1 || countOfOccurrences != 3 ) ) {

      // If a pair is found, add one instance of this dimension to our collection.
      rectangleDimensions .push( currentDimension );

    }


    // After processing a dimension, check if we have already collected the two necessary dimensions.
    if ( rectangleDimensions.length === 2 ) {

      break; // Exit the loop early as our goal is achieved.

    }

  }


  // Final check: if exactly two dimensions were successfully identified.
  if ( rectangleDimensions.length === 2 ) {

    // Output the product of the two dimensions, which represents the area.
    // JavaScript will automatically convert the string dimensions to numbers for the multiplication operation.
    console .log( rectangleDimensions[0] * rectangleDimensions[1] );

  } else {

    // If we could not find two suitable dimensions, output zero.
    console .log( 0 );

  }

}


// Invoke the primary processing function with input read from standard input.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );