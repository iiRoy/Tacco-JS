'use strict' // Enable strict mode for better error handling and cleaner code.

/*
 * This is the main function that processes the input string.
 * It takes a string 's' as input, which is expected to contain
 * multiple lines of data.
 *
 * The function first parses the input to extract a number 'n'
 * and a list of names. It then counts the occurrences of names
 * starting with 'M', 'A', 'R', 'C', 'H'.
 *
 * Finally, it calculates the total number of unique combinations
 * of three distinct counts from these initial letters and prints
 * the result to the console.
 */
function main ( s )
{

  // Split the input string 's' into an array of strings based on newline characters.
  s = s . split ( '\n' ) ;

  // The first element of the array 's' is expected to be a number 'n'.
  // Convert it from string to Number type.
  const n = Number ( s[ 0 ] ) ;
  // Extract the names from the input array.
  // 's.slice(1, -1)' gets all elements from the second one up to the second to last.
  const names = s . slice ( 1 , -1 ) ;

  // Initialize an array 'has' to store counts for names starting with 'M', 'A', 'R', 'C', 'H'.
  // The order corresponds to: has[0] for 'M', has[1] for 'A', etc.
  const has = [ 0 , 0 , 0 , 0 , 0 ] ;

  /*
   * Iterate over each name in the 'names' array.
   * For each name, check its first character and increment the corresponding counter
   * in the 'has' array.
   */
  for ( const name of names )
  {
    // Check if the name starts with 'M'
    if ( name . charAt ( 0 ) === 'M' ) has[ 0 ] ++ ;
    // Check if the name starts with 'A'
    if ( name . charAt ( 0 ) === 'A' ) has[ 1 ] ++ ;
    // Check if the name starts with 'R'
    if ( name . charAt ( 0 ) === 'R' ) has[ 2 ] ++ ;
    // Check if the name starts with 'C'
    if ( name . charAt ( 0 ) === 'C' ) has[ 3 ] ++ ;
    // Check if the name starts with 'H'
    if ( name . charAt ( 0 ) === 'H' ) has[ 4 ] ++ ;
  }

  let ans = 0 ; // Initialize the answer variable to store the final count of combinations.

  /*
   * This is a recursive helper function 'comb' to find combinations.
   * It selects three distinct counts from the 'has' array and calculates their product.
   *
   * @param {number} i   The current index being considered in the 'has' array (0 to 4).
   * @param {Array<number>} pro The array representing the current combination of selected counts.
   */
  const comb = ( i , pro ) =>
  {
    // Base case: If all 5 elements (indices 0-4) from 'has' have been considered.
    if ( i === 5 )
    {
      // If exactly 3 counts have been selected for the current combination.
      if ( pro . length === 3 )
      {
	    // Calculate the product of the three selected counts and add it to the total answer.
	    ans += pro . reduce ( ( a , b ) => a * b ) ;
      }
      return ; // Terminate this branch of recursion.
    }

    // Recursive call 1: Include the current count (has[i]) in the combination.
    // Creates a new array 'pro' with 'has[i]' appended.
    comb ( i + 1 , [ ...pro , has[ i ] ] ) ;

    // Recursive call 2: Exclude the current count (has[i]) from the combination.
    // Continues with the next index without adding has[i] to 'pro'.
    comb ( i + 1 , pro ) ;
    return ; // Terminate this branch of recursion.
  }

  // Start the combination process.
  // Call 'comb' with initial index 0 and an empty array for selected products.
  comb ( 0 , [ ] )

  // Output the final calculated answer to the console.
  console . log ( ans ) ;

}

/*
 * This line reads the input from standard input (/dev/stdin)
 * using Node.js's 'fs' module, converts it to a UTF-8 string,
 * and then passes it to the 'main' function for processing.
 */
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;