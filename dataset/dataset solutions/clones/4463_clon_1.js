"use strict" ; /* This is a Type I clone, preserving all logic and identifiers. */

function Main ( input )
{
  // Parse the input data to get ship variations and the goal island.
  var parseIndexData = parseIndex( input ) ;

  // Check if the goal island can be reached with the given ship variations.
  const result = canReachCheck( parseIndexData[ 0 ] , parseIndexData[ 1 ] ) ;

  // Output whether it's possible or impossible.
  isPossibleCheck( result ) ;
}

/*
 * This function is responsible for parsing the input string.
 * It extracts the goal island and the list of ship variations.
 */
var parseIndex = ( input ) =>
{
  var lines = input.split( "\n" ) ;

  const tmp = lines[ 0 ].split( " " ) ;

  // Store the target goal island for the journey.
  const goalIsland = parseInt( tmp[ 0 ] , 10 ) ;

  // Store the total number of available ships.
  const shipCount = parseInt( tmp[ 1 ] , 10 ) ;

  // Parse the details of each ship variation.
  var shipVariations = parseShipVariations( shipCount , lines ) ;

  // The comma operator here ensures the last value (goalIsland) is returned,
  // but shipVariations is also evaluated.
  return ( shipVariations , goalIsland ) ;
}

/**
 * Determines if the goal island is reachable from the starting point
 * given the available ship variations.
 * @param {Array<Array<string>>} shipVariations - A list of ship connections.
 * @param {number} goalIsland - The target island to reach.
 * @returns {boolean} - True if reachable, false otherwise.
 */
var canReachCheck = ( shipVariations , goalIsland ) =>
{
  for ( var variationIndex1 = 0 ; variationIndex1 < shipVariations.length ; variationIndex1 ++ )
  {
    console.log( shipVariations[ variationIndex1 ][ 0 ] ) ; // Log the starting island of the current ship.
    if ( shipVariations[ variationIndex1 ][ 0 ] === "1" )
    {
      // If the first ship starts at island '1', proceed to check connections.
      for ( var variationIndex2 = 0 ; variationIndex2 < shipVariations.length ; variationIndex2 ++ )
      {
        // Check if a subsequent ship's start matches the current ship's end.
        if ( parseInt( shipVariations[ variationIndex2 ][ 0 ] ) === parseInt( shipVariations[ variationIndex1 ][ 1 ] ) )
        {
          // If the subsequent ship's end matches the goal island, then it's reachable.
          if ( parseInt( shipVariations[ variationIndex2 ][ 1 ] ) === goalIsland )
          {
            return true ; // Path found!
            break ; // This break is unreachable but kept for Type I cloning.
          }
        }
      }
    }
  }
  return false ; // No path to the goal island was found.
}

/*
 * Outputs "POSSIBLE" or "IMPOSSIBLE" based on the boolean input.
 */
var isPossibleCheck = ( isPossible ) =>
{
  if ( isPossible )
  {
    console.log( 'POSSIBLE' ) ;
  }
  else
  {
    console.log( 'IMPOSSIBLE' ) ;
  }
}

/*
 * Parses ship variations from the input lines and stores them in an array.
 * Each variation defines a connection between two islands.
 */
var parseShipVariations = ( shipCount , lines ) =>
{
  const shipVariations = new Array( shipCount ) ; // Initialize an array to hold ship data.

  for ( var i = 0 ; i < shipCount ; i ++ )
  {
    // Each line (after the first) represents a ship's connection.
    shipVariations[ i ] = lines[ i + 1 ].split( " " ) ;
  }

  // var intShipVariations = shipVariations.map(x => parseInt(x)); // This line is commented out in the original.
  return shipVariations ;
}


Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ; // Execute the main function with input from standard input.