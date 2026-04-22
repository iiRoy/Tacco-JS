"use strict" ;

// Create an alias for the standard output logging mechanism.
const reportOutput = { display: console.log } ;

// Create an alias for the CommonJS module loading function.
const moduleResolver = require ;

// Access the file system utility module through its alias.
const fileSystemModule = moduleResolver ( 'fs' ) ;

// Create a specific alias for the synchronous file content reading function.
const contentReader = fileSystemModule . readFileSync ;

// Define a primary function to process and validate an input string.
const analyzeStream = ( inputContent ) => {
  // Preprocess the input: remove edge whitespace, segment into characters, then order them.
  let characterSequence = inputContent . trim () . split ( '' ) . sort () ;

  let outcomeIndicator = '' ; // Initialize a variable to store the final assessment.

  // Iterate through the ordered characters to detect any adjacent duplicates.
  for ( let currentPosition = 0 ; currentPosition < characterSequence . length ; currentPosition ++ ) {
    // Compare the character at the current index with the character immediately following it.
    if ( characterSequence [ currentPosition ] === characterSequence [ currentPosition + 1 ] ) {
      outcomeIndicator = "foundMatch" ; // If identical characters are adjacent, set the flag.
      break ; // No further checks are needed once a match is found.
    } else {
      outcomeIndicator = "noMatchYet" ; // If no match, continue searching.
    }
  }

  // Output the determined indicator, which signifies whether adjacent duplicates were present.
  reportOutput . display ( outcomeIndicator ) ;
} ;

// Execute the analysis routine, feeding it data read from the standard input stream,
// ensuring the content is interpreted as UTF-8 encoded text.
analyzeStream ( contentReader ( '/dev/stdin' , 'utf8' ) ) ;