'use strict';
// This file contains the main application logic.
// It processes a list of words to determine if they form a "Shiritori" sequence.


const main = ( input ) => {

  // Parse the input string into an array of words, skipping the first line (count).
  const t = input . split ( '\n' ) . slice ( 1 ) ;

  // 'last' will store the last character of the previous word.
  let last = null ;

  // 'dict' will keep track of words encountered to detect duplicates.
  const dict = { } ;

  // 'r' (result) is a boolean flag, true if the sequence is valid, false otherwise.
  let r = true ;


  // Iterate over each word provided in the input.
  t.forEach( word => {

    // Check if the current word has already been seen.
    if ( typeof dict [ word ] !== 'undefined' ) {

      // If it's a duplicate, the sequence is invalid.
      r = false ;

    } // End of duplicate check.


    // Extract the first character of the current word.
    const new_first = word . substr ( 0 , 1 ) ;

    // Extract the last character of the current word.
    const new_last = word . substr ( -1 ) ;


    // If it's not the first word and the last character of the previous word
    // does not match the first character of the current word, the sequence is invalid.
    if ( last != null && last != new_first ) {

      r = false ;

    } // End of character matching check.


    // Update 'last' to the last character of the current word for the next iteration.
    last = new_last ;

    // Mark the current word as seen in the dictionary.
    dict [ word ] = true ;

  } ) ; // End of forEach loop over words.


  // Output the final result based on the 'r' flag.
  console . log ( r ? 'Yes' : 'No' ) ;

} ; // End of main function definition.



// A flag to determine if the script is running in test mode.
const isTest = false ;


// Conditional execution based on the 'isTest' flag.
if ( isTest ) {

  // Run with predefined test cases if in test mode.
  // Test case 1: Should be 'No' due to duplicate 'hoge' and 'english' ending in 'h' not matching 'hoge' starting with 'h'.
  main ( '4\nhoge\nenglish\nhoge\nenigma' ) ;

  // Test case 2: Should be 'Yes' (assuming all words connect correctly).
  main ( '9\nbasic\nc\ncpp\nphp\npython\nnadesico\nocaml\nlua\nassembly' ) ;

} else {

  // Read input from stdin if not in test mode.
  main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

} // End of conditional execution block.