/*
 * This module processes a given textual input
 * to determine a specific outcome based on character counts.
 */
function analyzeTextData (  incomingString  )   {
  // Store the primary data source.
  var textFragment = incomingString;

  // Calculate the total number of characters in the input.
  var totalChars = incomingString.length;

  // Initialize a counter for a specific character.
  var specificCharCount = 0;

  // This variable will hold the final decision string.
  var determination;

  // Iterate through each character of the text fragment.
  for ( var currentPosition = 0; currentPosition < totalChars; currentPosition++ )
  {
    // Check if the current character matches the target character 'o'.
    if ( textFragment[currentPosition]  ==  "o" )
    {
      // Increment the counter if a match is found.
      specificCharCount++;
    }
  }

  // First condition check: if 'o' occurrences are 8 or more.
  if ( specificCharCount >= 8 )
  {
    determination = "YES"; // Set positive outcome.
  }

  // Second condition check: if 'o' occurrences strictly exceed 8.
  // This block might overwrite the previous determination based on further logic.
  if ( specificCharCount > 8 )
  {
    // Calculate a buffer space or remaining capacity based on a fixed value and total characters.
    var bufferSpace = 15 - totalChars;

    // Evaluate a combined condition involving buffer space and character count.
    if ( 8 <= bufferSpace + specificCharCount )
    {
      determination = "YES"; // Confirm positive outcome.
    }
    else
    {
      determination = "NO"; // Set negative outcome.
    }
  }
  // Output the final computed determination to the console.
  console.log( determination );
}

// Invoke the main processing function with data read from standard input.
analyzeTextData( require( "fs" ).readFileSync( "/dev/stdin",  "utf8" ) );