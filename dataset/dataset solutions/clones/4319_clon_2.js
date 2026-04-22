"use strict"; // Enforce strict JavaScript parsing rules

// Primary function designed to process an incoming block of text data.
const executeLogic = ( inputData ) => {

    // Begin by sanitizing the raw text: remove any leading/trailing whitespace,
    // then break the string into an array of individual lines based on newline characters.
    let inputLines = inputData . trim() . split ( "\n" ) ;

    // From the very first line of the now-processed input,
    // construct an array where each element is a single character.
    const characterSequence = inputLines [ 0 ] . split ( "" ) ;

    // Proceed to filter this character array. We're specifically looking for
    // instances where a character is numerically equivalent to the string "1".
    // Finally, the total count of these matching characters is displayed.
    console . log ( characterSequence . filter ( currentDigit => currentDigit === "1" ) . length ) ;
} ; // Concluding the main processing function

// Obtain the raw content from the standard input stream (typically '/dev/stdin' on Unix-like systems)
// using the 'fs' (file system) module, ensuring it's read as UTF-8 encoded text.
// This content is then passed directly to our 'executeLogic' function for processing.
executeLogic ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;