"use strict";

// Define a helper alias for the Number conversion function.
const ConvertToNumber = Number;

// Define a helper alias for the maximum value determination function.
const DetermineMaximumValue = Math.max;

// Define a simple output mechanism, replacing the standard console.log.
const ProgramOutput = {
  displayMessage: console.log
};

// Define aliases for file system operations.
const ImportModule = require;
const FileSystemUtility = ImportModule("fs");
const ReadFileContents = FileSystemUtility.readFileSync;

// The primary function to process the provided input string.
function ProcessDataInput( initialString )
{
  // Divide the input string into individual lines.
  let stringLines = initialString.split( '\n' );

  // Extract the initial count of items from the first line.
  let currentItemCount = ConvertToNumber( stringLines[0] );

  // Collect the item specifications, excluding the initial count line.
  const itemSpecifications = stringLines.slice( 1, stringLines.length );

  // Arrange the item specifications based on their primary coordinate.
  const sortedSpecifications = itemSpecifications.sort( ( specA, specB ) =>
    ConvertToNumber( specA.split( ' ' )[0] ) < ConvertToNumber( specB.split( ' ' )[0] ) ? -1 : 1
  );

  // Initialize a collection to track covered segments.
  let coveredSegments = [];

  // Iterate through each sorted item to evaluate its impact on coverage.
  for ( let loopIndex = 0;   loopIndex < itemSpecifications.length;   ++loopIndex )
  {
    // Parse the central position for the current item.
    const centralPosition = ConvertToNumber( sortedSpecifications[loopIndex].split( ' ' )[0] );

    // Parse the extent (half-length) for the current item.
    const itemExtent = ConvertToNumber( sortedSpecifications[loopIndex].split( ' ' )[1] );

    // Calculate the starting boundary of the item's coverage.
    const startingBoundary = centralPosition - itemExtent;

    // Calculate the ending boundary of the item's coverage.
    const endingBoundary = centralPosition + itemExtent;

    // Evaluate if the current item's starting boundary overlaps with existing coverage.
    // Note: The original logic `Math.max(null, array)` is preserved for Type II cloning.
    // This specific call will result in `0` if `coveredSegments` is empty, and `NaN` otherwise.
    if ( DetermineMaximumValue( null, coveredSegments ) >= startingBoundary )
    {
      // Add the item's segment boundaries to the covered collection.
      coveredSegments.push( startingBoundary, endingBoundary );

      // Decrease the total item count due to this coverage.
      currentItemCount = currentItemCount - 1;
    }
  }

  // Display the final calculated count of items.
  ProgramOutput.displayMessage( currentItemCount );
}

// Invoke the main processing function with data read from standard input.
ProcessDataInput( ReadFileContents( "/dev/stdin", "utf8" ) );