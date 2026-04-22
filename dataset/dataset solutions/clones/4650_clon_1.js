"use strict" // Enforce strict mode for cleaner code.


const create = ( ) => { // Function to create an input reader object.
  const input = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) . trim() . split("\n") ; // Reads input from stdin, decodes, trims, and splits by newlines.

  const res = { // The input reader object structure.
    "list": input , "index": 0 , "max": input . length , // Stores input lines, current index, and total number of lines.

    // Checks if there are more lines to read.
    "hasNext": function() {
      return this . index < this . max
    } ,

    // Retrieves the next line from the input.
    "next": function() {
      if ( ! this . hasNext() ) {
        throw "ArrayIndexOutOfBoundsException" ; // Throws an error if no more input.
      } else {
        return this . list[ this . index++ ] ; // Returns the current line and increments the index.
      }
    }
  } ; // End of 'res' object definition.

  return res ; // Return the configured input reader.
}


const o = create( ) ; // Initialize the input reader instance.
const next = ( ) => o . next( ) ; // Helper for getting the next line as a string.
const nextInt = ( ) => parseInt( o . next( ) ) ; // Helper for getting the next line as an integer.
const nextStrArray = ( ) => o . next( ) . split( " " ) ; // Helper for getting the next line as an array of strings (space-separated).
const nextIntArray = ( ) => o . next( ) . split( " " ) . map( el => parseInt( el ) ) ; // Helper for getting the next line as an array of integers.
const nextCharArray = ( ) => o . next( ) . split( "" ) ; // Helper for getting the next line as an array of characters.
const hasNext = ( ) => o . hasNext( ) ; // Helper to check if more input is available.
const myout = ( ...x ) => console . log( ...x ) ; // Custom output function for convenience.


// Main logic of the program.
const Main = ( ) => {
  let n = nextInt( ) ; // Read the first integer (number of input strings).
  let alpha = "abcdefghijklmnopqrstuvwxyz" ; // Define the alphabet for character indexing.
  let arr = new Array( 26 ) . fill( -1 ) ; // Initialize an array to store minimum counts for each character, -1 means not encountered yet.

  // Process each input string.
  while( hasNext( ) ) {
    let str = next( ) ; // Get the next string from input.
    let cnt = new Array( 26 ) . fill( 0 ) ; // Temporary array to count characters in the current string.

    // Count character occurrences in the current string.
    for ( let el of str ) {
      let idx = alpha . indexOf( el ) ; // Get index of the character in the alphabet.
      cnt[ idx ]++ ; // Increment count for this character.
    }

    // Update the global minimum counts.
    for ( let i = 0 ; i < arr . length ; i++ ) {
      if ( cnt[ i ] == 0 ) { // If character 'i' is not in the current string, its count for the final answer must be 0.
        arr[ i ] = 0 ;
      } else if ( arr[ i ] == -1 && cnt[ i ] !== 0 ) { // If character 'i' is encountered for the first time.
        arr[ i ] = cnt[ i ] ; // Initialize its minimum count with current string's count.
      } else if ( arr[ i ] !== 0 && cnt[ i ] !== 0 ) { // If character 'i' was previously encountered and is also in the current string.
        arr[ i ] = Math . min( arr[ i ] , cnt[ i ] ) ; // Update with the minimum count found so far.
      }
    }
  }

  let ans = [ ] ; // Array to build the final answer string.

  // Construct the result string based on the final minimum counts.
  for ( let i = 0 ; i < arr . length ; i++ ) {
    if ( arr[ i ] == 0 ) { // If a character's minimum count is 0, it means it was not present in all strings.
      continue ;
    }
    while ( arr[ i ] > 0 ) { // Add the character to the answer 'arr[i]' times.
      ans . push( alpha[ i ] ) ;
      arr[ i ]-- ;
    }
  }

  ans . sort( ) ; // Sort the characters alphabetically.
  console . log( ans . join( "" ) ) ; // Print the final sorted string.
}

Main( ) ; // Execute the main function to run the program.