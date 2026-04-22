/*
 * This JavaScript module defines a function `Main` to solve a specific string manipulation problem.
 * It uses a recursive approach to find the occurrences of a 'word' within a potentially repeating 'sentence'.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

const Main = ( input ) => { // The primary entry point function.
  // First, we prepare the input by splitting it into individual lines.
  input = input.split( "\n" ) ;

  /*
   * The 'sentence' variable holds the first line of the input.
   * This is the string that will be searched and potentially repeated.
   */
  const sentence = input[ 0 ] ;

  // The 'word' variable holds the second line of the input.
  // This is the sequence of characters we are trying to find within the 'sentence'.
  const word = input[ 1 ] ;

  /**
   * The core recursive function 'rec' is designed to find the word.
   *
   * @param {number} i     - The current index within the 'word' we are trying to match.
   * @param {string} temp  - The current temporary string being searched.
   * @param {boolean} bool - A flag indicating if we have already appended the 'sentence' to 'temp' once.
   * @param {number} count - The accumulated count, representing the total index traversed.
   * @returns {number} The final count if successful, or -1 if the word cannot be found.
   */
  const rec = ( i , temp , bool , count ) => {
    // Base case: If we have successfully matched all characters of the 'word'.
    if ( i === word.length ) {
      return count ;
    }

    // Find the index of the current character of 'word' (word[i]) within the 'temp' string.
    const idx = temp.indexOf( word[ i ] ) ;

    // Ternary operator to handle the two main scenarios: character found or not found.
    return ( idx !== -1 )
           ? rec( i + 1 ,                               // Move to the next character in 'word'.
                  temp.slice( idx , temp.length ) ,    // Update 'temp' to start from the found character.
                  true ,                               // Set 'bool' to true (we've found something).
                  count + idx )                        // Add the found index to the total count.
           : (                                         // If the character was NOT found in 'temp'.
               bool                                    // Check the 'bool' flag.
               ? rec( i ,                              // Keep 'i' the same (retry current character).
                      temp + sentence ,                // Append the original 'sentence' to 'temp'.
                      false ,                          // Set 'bool' to false (we've just appended once).
                      count )                          // 'count' remains unchanged as we are retrying.
               : -1                                    // If 'bool' is already false, it means we've already appended 'sentence' once and still couldn't find the character, so it's impossible.
             )
    ;
  } ; // End of recursive function 'rec'.

  // Call the recursive function starting from the beginning (i=0), with the initial sentence,
  // 'bool' as false (haven't appended yet), and 'count' initialized to 1 (as per problem logic).
  // The result is then printed to the console.
  console.log( rec( 0 , sentence , false , 1 ) ) ;

} ; // End of Main function definition.


// Execute the Main function, providing it with content read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;