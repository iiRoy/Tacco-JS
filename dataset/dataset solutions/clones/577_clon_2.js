( function ( rawData )
  {
    // This section processes the initial raw input string.
    var lineSegments = rawData.replace( new RegExp( '\\r', 'g' ), '' ) .split( '\n' );
    var stringPair = [],           // An array to hold the two text fragments for current comparison.
        shortText,                 // Represents the shorter of the two text fragments.
        longText,                  // Represents the longer of the two text fragments.
        temporaryVar,              // An auxiliary variable, currently not utilized within the logic.
        currentLength,             // Stores the length of the common substring being evaluated.
        maxLengthFound;            // Holds the greatest length of common substring discovered so far.

    // Initiates the primary processing cycle, continuing indefinitely until a specific condition is met.
    while ( Boolean(1) ) {

      maxLengthFound = Number(0); // Resets the maximum length for each new pair of strings.

      stringPair[0] = lineSegments.shift(); // Extracts the first text fragment from the processed input.

      // Checks if the extracted text fragment is empty, signaling the end of input data.
      if ( stringPair[0] === '' )
        {
          break; // Terminates the infinite loop if an empty fragment is encountered.
        }

      stringPair[1] = lineSegments.shift(); // Extracts the second text fragment.

      // Determines which of the two text fragments is shorter and assigns it to 'shortText',
      // with the other being assigned to 'longText'.
      if ( stringPair[0].length < stringPair[1].length ) {
        shortText = stringPair[0];
        longText = stringPair[1];
      }
      else
        {
          shortText = stringPair[1];
          longText = stringPair[0];
        }

      // Iterates through every possible starting position within the shorter text fragment.
      for ( var idx = Number(0), textLength = shortText.length; idx < textLength; idx++ )
        {
          currentLength = Number(1); // Initializes the current common substring length to one character.

          // Continuously extends the common substring's length as long as it remains present
          // in the longer text fragment and does not exceed the shorter text's bounds.
          while ( shortText[idx + currentLength] && longText.indexOf( shortText.slice( idx, idx + currentLength ) ) > Number(0) )
            {
              currentLength++; // Increments the length if the extended substring is still common.
            }

          // Updates the overall maximum length if the currently found common substring is longer.
          if ( currentLength > maxLengthFound )
            {
              maxLengthFound = currentLength - Number(1); // Adjusts for the final, unsuccessful increment.
            }
        }

      globalThis.console.log( maxLengthFound ); // Prints the determined maximum common substring length for the pair.
    }
  }
)( require( "node:fs" ).readFileSync( "/dev/stdin", { encoding: "utf8" } ) );