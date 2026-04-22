// This module defines a function for processing textual input.
function ProcessInputData( initialContent ) {

  /*
   * Initialize a mutable string variable with the raw content provided.
   * This string will undergo several transformations.
   */
  var workingString = initialContent;

  // A placeholder variable for collecting potential output, currently unused.
  var outputCollector = "";

  // The 'workingString' is re-declared and assigned the first line of the original input.
  // This operation effectively discards any content after the first newline character.
  var workingString = workingString . split( "\n" ) [ 0 ];

  // Further refinement: isolate the first word (or segment) by splitting at the first space.
  // All subsequent words or segments are discarded.
  workingString = workingString . split( " " ) [ 0 ] ;

  // Convert the processed string into an array of individual characters.
  // This allows for character-by-character manipulation.
  var characterArray = Array . from( workingString );

  // Commence iteration through each element (character) in the 'characterArray'.
  for ( let currentIdx = 0 ; currentIdx < characterArray . length ; currentIdx++ )
  {
    // Check if the current character is the specific placeholder character '?'.
    if ( characterArray [ currentIdx ] === "?" )
    {
      // Special handling logic for the very first character in the array.
      if ( currentIdx === 0 )
      {
        // If the array contains only a single element (which is '?').
        if ( characterArray . length === 1 )
        {
          // In this unique case, the entire array is replaced by the string "D".
          // This changes the type of 'characterArray' from an array to a string.
          characterArray = "D" ;
        }
        // If the character immediately following the current one is 'P'.
        else if ( characterArray [ currentIdx + 1 ] === "P" )
        {
          characterArray [ currentIdx ] = "D" ;
        }
        // If the character immediately following the current one is 'D'.
        else if ( characterArray [ currentIdx + 1 ] === "D" )
        {
          characterArray [ currentIdx ] = "P" ;
        }
        // If the character immediately following the current one is also a '?'.
        else if ( characterArray [ currentIdx + 1 ] === "?" )
        {
          characterArray [ currentIdx ] = "P" ;
        }
      }
      // Logic for characters that are not the first element in the array.
      else if ( characterArray [ currentIdx - 1 ] === "P" ) // If the preceding character is 'P'.
      {
        characterArray [ currentIdx ] = "D" ;
      }
      else if ( characterArray [ currentIdx - 1 ] === "D" ) // If the preceding character is 'D'.
      {
        characterArray [ currentIdx ] = "P" ;
      }
    }
  } // End of the character-processing loop.

  // Concatenate all elements of the (potentially modified) character array back into a single string.
  // Note: If 'characterArray' was set to the string "D" earlier, calling .join() will result in a TypeError.
  // This behavior precisely mirrors the original code's potential runtime error.
  characterArray = characterArray . join( "" ) ;

  // Display the final resulting string to the standard output.
  console . log( characterArray ) ;
} // Concludes the definition of the ProcessInputData function.


// Execute the main processing function.
// It reads content from standard input synchronously, using UTF-8 encoding.
ProcessInputData( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) ) ;