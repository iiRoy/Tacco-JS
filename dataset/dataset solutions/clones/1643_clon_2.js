/*
 * This module provides a utility function to categorize a given numerical value.
 * It reads a numerical input and outputs a specific category identifier based on predefined ranges.
 */
function ProcessNumericValue( incomingDatum ) {
  // Evaluate the provided numerical datum against a series of thresholds.
  // Each range corresponds to a distinct output category.
  if ( incomingDatum >= 400 && incomingDatum <= 599 ) {
    console.log( '8' ); // Output for values in the 400-599 range
  }
  else if ( incomingDatum >= 600 && incomingDatum <= 799 ) {
    console.log( '7' ); // Output for values in the 600-799 range
  }
  else if ( incomingDatum >= 800 && incomingDatum <= 999 ) {
    console.log( '6' ); // Output for values in the 800-999 range
  }
  else if ( incomingDatum >= 1000 && incomingDatum <= 1199 ) {
    console.log( '5' ); // Output for values in the 1000-1199 range
  }
  else if ( incomingDatum >= 1200 && incomingDatum <= 1399 ) {
    console.log( '4' ); // Output for values in the 1200-1399 range
  }
  else if ( incomingDatum >= 1400 && incomingDatum <= 1599 ) {
    console.log( '3' ); // Output for values in the 1400-1599 range
  }
  else if ( incomingDatum >= 1600 && incomingDatum <= 1799 ) {
    console.log( '2' ); // Output for values in the 1600-1799 range
  }
  else if ( incomingDatum >= 1800 && incomingDatum <= 1999 ) {
    console.log( '1' ); // Output for values in the 1800-1999 range
  }
}

// Fetch the raw content from the standard input stream and pass it for processing.
ProcessNumericValue( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) );