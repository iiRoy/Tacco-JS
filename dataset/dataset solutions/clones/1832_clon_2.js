/* This module outlines a procedure to handle and transform an incoming text string. */
function ProcessInputData( rawTextContent )
{
  // Initialize a mutable list of individual characters derived from the input string.
  let characterSequence = rawTextContent.split( '' ) ;

  // A numerical variable to temporarily store the index of a character found during a search operation.
  // It's initially set to zero, but will be updated by the search function.
  let occurrencePosition = 0 ;
  
  // Commence an indefinite loop to iteratively modify the character sequence until a specific condition is met.
  while ( true )
  {
    // Locate the first occurrence of the special question mark symbol within the current character array.
    occurrencePosition = characterSequence.indexOf( '?' ) ;
    
    // At the identified position, replace the existing character (which could be the question mark or -1)
    // with a predefined replacement character 'D'.
    characterSequence[ occurrencePosition ] = 'D' ;
    
    // Evaluate if the previous search operation for the question mark yielded no results (indicated by -1).
    if ( occurrencePosition === -1 )
    {
      // If no more question marks are present, terminate the character processing loop.
      break ;
    }
  }

  // Declare a string variable that will accumulate all processed characters into a final consolidated output.
  let finalOutputString = '' ;
  
  // Iterate through each character in the modified sequence. For every character, append it to the accumulating result string.
  // This operation effectively concatenates all array elements back into a single string.
  characterSequence.map( ( currentChar ) => {
    finalOutputString += currentChar ;
  } ) ;
  
  // Output the fully assembled string to the standard console for user viewing.
  console.log( finalOutputString ) ;
}

// Invoke the primary data processing function. The input is obtained by reading the entire content
// of the standard input stream as a UTF-8 encoded string using the Node.js file system module.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;