'use strict';
( function ( inputBuffer ) {
  // Obtain the full textual content from the provided buffer.
  let entireText = inputBuffer . toString ( ) ;

  // Define a regular expression to identify specific segments within the text.
  // This pattern looks for a sequence of alphabetic characters, followed by a newline,
  // and then one or more lines, each containing a number (not starting with zero)
  // and ending with a newline.
  const textPattern = / [A-Za-z]+ \n ( [1-9][0-9]* \n ) + / g ;

  // Initiate a self-executing function to process the structured data.
  // The result of this processing will be stored in 'processedResult'.
  const processedResult = ( function ( structuredData ) {
    // For each block of structured data, perform a series of transformations.
    return structuredData
      . map ( function ( currentBlock ) {
        // The first element of 'currentBlock' is the initial string.
        // The second element (currentBlock[1]) indicates the count of numbers
        // at the end of the block that represent rotation values.
        // We slice these rotation values and convert them to integers.
        return currentBlock . slice ( - currentBlock [ 1 ] )
          . map ( function ( numberString ) {
            // Explicitly convert each string to an integer using parseInt.
            return parseInt ( numberString , 10 ) ;
          } )
          . reduce ( function ( accumulatedString , shiftValue ) {
            // Output the current rotation value to the console for observation.
            console . log ( shiftValue ) ;
            // Perform a string rotation: move the initial 'shiftValue' characters
            // from the beginning of the string to its end.
            return accumulatedString . slice ( shiftValue ) + accumulatedString . slice ( 0 , shiftValue ) ;
          } , currentBlock [ 0 ] ) ; // The initial string for the reduce operation is the first item in 'currentBlock'.
      } )
      . join ( '\n' ) ; // Combine all the transformed strings into a single string, separated by newlines.
  } ( entireText . match ( textPattern ) . map ( function ( rawBlock ) {
    // First, find all occurrences that match the 'textPattern' within the 'entireText'.
    // Then, for each matched 'rawBlock', remove leading/trailing whitespace and split it into an array of lines.
    return rawBlock . trim ( ) . split ( '\n' ) ;
  } )
  ) ) ;

  // Display the final processed output to the standard console.
  console . log ( processedResult ) ;

} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // Read the content of '/dev/stdin' as UTF-8 and pass it as 'inputBuffer' to the main function.