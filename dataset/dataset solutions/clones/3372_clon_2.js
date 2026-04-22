/*
 * This module processes raw textual data to count eligible entries.
 * It's designed to analyze lines based on specific criteria derived from the first line.
 */
function ExecuteLogic( sourceContent )
{
  // Split the entire input content into individual lines.
  sourceContent = sourceContent.split( "\n" );

  // The first line contains configuration parameters, separated by spaces.
  var criteriaValues = sourceContent[0].split( " " );

  // Initialize a counter for items that meet the specified conditions.
  var eligibleItems = 0;

  // Iterate through the remaining lines, starting from the second line (index 1).
  for ( var idxRow = 1; idxRow < sourceContent.length; idxRow++ )
  {
    // Split the current line into its constituent data points, separated by spaces.
    var currentEntry = sourceContent[idxRow].split( " " );

    // Check if the first and second data points of the current entry
    // meet the respective criteria from the configuration values.
    // Note: JavaScript's >= operator handles implicit type coercion for strings that look like numbers.
    if ( currentEntry[0] >= criteriaValues[1] && currentEntry[1] >= criteriaValues[2] )
    {
      eligibleItems++; // Increment the counter if both conditions are met.
    }
  }

  // Output the final count of eligible items to the console.
  console.log( eligibleItems );
}

// Invoke the primary logic function immediately with data read from standard input.
ExecuteLogic(
  require( "fs" )
    .readFileSync( "/dev/stdin", "utf8" )
    .trim()
);