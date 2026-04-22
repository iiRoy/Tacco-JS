/*
 * This JavaScript module reads content from standard input,
 * processes the last line using an affine cipher,
 * and prints any results that match specific patterns.
 */
require ( "fs" )
  . readFileSync ( "/dev/stdin" , "utf8" ) // Obtain raw content from the standard input stream
  . split ( '\n' ) // Divide the content into an array of individual lines
  . slice ( -1 ) // Extract only the final line from the input array
  . map ( function ( currentLine ) { // Iterate over the (single) last line of input
    
    // Define numeric constants for the cryptographic operations.
    const ALPHABET_SPAN = 26; // Represents the number of letters in the English alphabet
    const ASCII_LOWERCASE_A_OFFSET = 97; // ASCII value for the character 'a'

    // This nested loop attempts various affine cipher key combinations (a and b)
    // The outer loop handles the 'a' component (multiplication factor)
    for ( let multiplierCoefficient = ALPHABET_SPAN; multiplierCoefficient--; ) {
      
      // The inner loop handles the 'b' component (additive shift)
      for ( let additiveShift = ALPHABET_SPAN; additiveShift--; ) {
        
        // Apply the affine transformation to each alphanumeric character in the input line
        let outputCandidateString = currentLine . replace ( /[\w]/g , function ( inputCharacter ) {
          // Retrieve the ASCII character code for the current input character
          let initialCharCode = inputCharacter . charCodeAt ( 0 );
          
          // Apply the affine cipher formula: (ax + b) mod m, where m is ALPHABET_SPAN
          // Then convert the result back to an ASCII character code within the lowercase range
          let transformedCharCode = ( initialCharCode * multiplierCoefficient + additiveShift ) % ALPHABET_SPAN + ASCII_LOWERCASE_A_OFFSET;
          
          // Return the character corresponding to the transformed ASCII code
          return String . fromCharCode ( transformedCharCode );
        } );

        // Check if the newly generated string contains specific keywords ("this" or "that")
        if ( outputCandidateString . match ( /th(is|at)/ ) ) {
          
          // If a match is found, display the processed string to the console
          console . log ( outputCandidateString );
          
        } else {
          
          // If no specific keywords are found, perform no explicit action (original code used '0')
          0; 
        }
      }
    }
  } );