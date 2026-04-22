function ProcessInputData( sourceDataString ) { // Function to analyze character frequencies from input data
  var textRows = sourceDataString . split( '\n' ) ; // Divide the entire input string into individual lines
  var letterOccurrences = [ ] ; // Initialize an array to store the frequency of each character

  for ( var lineIterator in textRows ) { // Iterate through each line of the provided text
    // Check if the current line is empty, indicating the end of relevant input data
    if ( textRows[ lineIterator ] === "" ) break ; // Stop processing if an empty line is encountered, indicating end of useful input

    for ( var characterPosition = 0 ; characterPosition < textRows[ lineIterator ].length ; ++characterPosition ) { // Traverse each character within the current line
      var currentCharacterLowerCase = textRows[ lineIterator ][ characterPosition ].toLowerCase() ; // Get the lowercase version of the current character

      // Update the frequency count for the current character
      if ( !letterOccurrences[ currentCharacterLowerCase ] ) { // Check if this character has been encountered before
        letterOccurrences[ currentCharacterLowerCase ] = 1 ; // First occurrence: initialize count to one
      } else {
        ++letterOccurrences[ currentCharacterLowerCase ] ; // Subsequent occurrence: increment its count
      }
    } // End of inner loop for characters
  } // End of outer loop for lines

  // Now, iterate through all lowercase English alphabet characters and display their frequencies
  for ( var unicodeValue = 97 ; unicodeValue <= 122 ; ++unicodeValue ) { // Iterate through the ASCII values for lowercase English letters (a-z)
    var alphabeticalChar = String.fromCharCode( unicodeValue ) ; // Convert the numerical ASCII value back to its character representation

    // Print the character and its frequency, defaulting to 0 if not found
    console.log( alphabeticalChar + " : " + ( ( letterOccurrences[ alphabeticalChar ] ) ? letterOccurrences[ alphabeticalChar ] : 0 ) ) ; // Display the character and its total frequency, or 0 if not found
  } // End of loop for printing frequencies
} // End of main processing function

// Invoke the main function with data read from standard input
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;