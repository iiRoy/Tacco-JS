/*
 * This module processes a given input string to determine
 * if a specific character sequence condition is met.
 */
function processInputContent( rawContent )
{
  // Split the raw input string by newline characters into an array of lines.
  var contentLines = rawContent.split( "\n" );

  // The primary string to be analyzed is the first line of the input.
  var searchString = contentLines[ 0 ];

  // Initialize variables to store the positions of the target characters.
  // 'firstOccurrenceOfC' will hold the index of the first 'C'.
  // 'lastOccurrenceOfF' will hold the index of the last 'F'.
  var firstOccurrenceOfC, lastOccurrenceOfF;

  // Iterate through the search string from the beginning
  // to find the first occurrence of the character 'C'.
  for ( var iteratorIndex = 0; iteratorIndex < searchString.length; iteratorIndex++ )
  {
    // If 'C' is found, store its index and exit the loop.
    if ( searchString[ iteratorIndex ] === "C" )
    {
      firstOccurrenceOfC = iteratorIndex;
      break;
    }
  }

  // Iterate through the search string from the end
  // to find the last occurrence of the character 'F'.
  for ( var reverseIterator = searchString.length - 1; reverseIterator >= 0; reverseIterator-- )
  {
    // If 'F' is found, store its index and exit the loop.
    if ( searchString[ reverseIterator ] === "F" )
    {
      lastOccurrenceOfF = reverseIterator;
      break;
    }
  }

  // Compare the found indices to determine the final output.
  // The condition is met if 'C' appears before 'F' in the string.
  if ( firstOccurrenceOfC < lastOccurrenceOfF )
  {
    console.log( "Yes" ); // Output "Yes" if 'C' comes before 'F'.
  }
  else
  {
    console.log( "No" );  // Output "No" otherwise.
  }
}

// Main execution block: Read input from standard input and pass it to the processing function.
// Renaming 'require("fs")' to 'fileOperations' for Type II compliance, as 'fs' is an identifier.
const fileOperations = require( "fs" );
processInputContent( fileOperations.readFileSync( "/dev/stdin", "utf8" ) );