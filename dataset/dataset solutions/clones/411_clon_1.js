/*
 * This function generates all possible permutations of numbers from 0 to n-1.
 * It uses a recursive backtracking algorithm to achieve this.
 *
 * @param {number} n - The upper limit (exclusive) for the numbers to permute.
 * @returns {Array<Array<number>>} - An array containing all permutations.
 */
function zyunretu (  n  )
{
  // permArr will store all generated permutations.
  var permArr = [] ;

  // usedChars keeps track of characters used in the current permutation being built.
  var usedChars = [] ;


  /*
   * The core recursive function to generate permutations.
   *
   * @param {Array<number>} input - The remaining elements to permute.
   * @returns {Array<Array<number>>} - The final array of permutations (accessed via permArr).
   */
  var permute = function ( input )
  {
    var i  ,  ch ; // Declare loop counter and current character variable.

    for ( i = 0 ; i < input.length ; i++ )
    {
      // Extract the current character from the input array.
      ch = input.splice ( i , 1 ) [ 0 ] ;

      // Add the extracted character to the list of used characters.
      usedChars.push ( ch ) ;

      // If no characters are left in the input, a complete permutation has been formed.
      if ( input.length == 0 )
      {
        // Add a copy of the current permutation to permArr.
        permArr.push ( usedChars.slice ( ) ) ;
      }

      // Recursively call permute with the reduced input.
      permute ( input ) ;

      // Backtrack: Insert the character back into its original position.
      input.splice ( i , 0 , ch ) ;

      // Backtrack: Remove the character from usedChars.
      usedChars.pop ( ) ;
    }
    return permArr ; // This return is technically not strictly necessary as permArr is a closure variable.
  } ;

  // Initialize an array with numbers from 0 to n-1.
  var arr = [ ] ;
  for ( var i = 0 ; i < n ; i++ )
  {
    arr.push ( i ) ;
  }

  // Start the permutation process with the initialized array.
  return permute ( arr ) ;
}


// --- Main Program Execution ---

// Read input from standard input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace and split the input into an array of lines.
var arr = input.trim ( ) . split ( "\n" ) ;


// Process multiple test cases until an input of 0 is encountered.
while ( true )
{
  // Get the number of items for the current test case.
  // The `-0` converts the string to a number.
  var n = arr.shift ( ) - 0 ;

  // If n is 0, terminate the program.
  if ( n == 0 )
  {
    break ;
  }

  // nww will store the items with their properties.
  var nww = [ ] ;

  // Read n lines, each representing an item.
  // Each line is split by space.
  for ( var i = 0 ; i < n ; i++ )
  {
    nww [ i ] = arr.shift ( ) . split ( " " ) ;
  }

  // Map the raw string data to a more usable format: [name, weight, limit].
  // Convert weight and limit to numbers.
  nww = nww.map ( v => [ v [ 0 ] , v [ 1 ] - 0 , v [ 2 ] - 0 ] ) ;

  // Generate all permutations of indices for the current n items.
  var all = zyunretu ( n ) ;

  // Initialize variables for tracking the maximum average.
  var max = 0 ;
  var ans = "" ;

  // Iterate over each permutation.
  all.forEach ( v =>
  {
    var flag = true ; // Flag to check if the current permutation is valid.
    var sum = 0 ;     // Accumulator for total weight.
    var g = 0 ;       // Accumulator for weighted sum (g-value).

    // Iterate over items in the current permutation.
    v.forEach ( ( i , j ) =>
    {
      // Check if the cumulative weight exceeds the item's limit.
      if ( sum > nww [ i ] [ 2 ] )
      {
        flag = false ; // Mark as invalid.
      }
      sum += nww [ i ] [ 1 ] ;       // Add item's weight to cumulative sum.
      g += nww [ i ] [ 1 ] * ( j + 1 ) ; // Add weighted value (weight * position).
    } ) ;

    // If the permutation is valid and its average (g/sum) is greater than the current max.
    if ( flag && g / sum > max )
    {
      max = g / sum ; // Update max average.
      ans = v ;       // Store this permutation as the best answer so far.
    }
  } ) ;

  // Output the names of the items in the best permutation, reversed, and joined by newlines.
  // nww[v][0] retrieves the original name using the index from the permutation.
  console.log ( ans.map ( v => nww [ v ] [ 0 ] ) . reverse ( ) . join ( "\n" ) ) ;
}