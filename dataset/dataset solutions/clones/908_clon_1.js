/* This section declares global variables used throughout the program. */
var n ; // Represents the number of input strings to process.
var s = [ ] ; // An array to store the input strings.
var p = [ ] ; // An array to store the simplified 'balance' pairs for each string.


/**
 * Simplifies a given string by calculating its balance of parentheses.
 * The balance is represented by a pair [open_needed, close_excess].
 *
 * @param {string} s - The input string, expected to contain parentheses.
 * @returns {number[]} A two-element array:
 *                     - p[0]: Count of unmatched ')' characters (close_excess).
 *                     - p[1]: Count of unmatched '(' characters (open_needed).
 */
function simplify ( s )
{
  var p = [ 0 , 0 ] ; // Initialize the balance pair: [excess_close, open_needed].

  // Iterate over each character in the string 's'.
  rep ( s . length , function ( i )
  {
    // Check if the current character is an opening parenthesis.
    if ( s . charAt ( i ) === '(' )
    {
      // If it's an opening parenthesis, increment the count of open_needed.
      ++ p [ 1 ] ; // Increment p[1] for open parentheses.
    }
    else // The character is a closing parenthesis.
    {
      // If there are open parentheses available to match.
      if ( p [ 1 ] > 0 )
      {
        // Decrement the count of open_needed as it's matched.
        -- p [ 1 ] ; // Decrement p[1] because a ')' matched an '('.
      }
      else // No open parentheses to match, this ')' is an excess.
      {
        // Increment the count of excess closing parentheses.
        ++ p [ 0 ] ; // Increment p[0] for excess closing parentheses.
      }
    }
  } ) ; // End of character iteration for simplification.

  return p ; // Return the calculated balance pair.
} // End of simplify function.


/*
 * The main execution function of the program.
 * It reads input, processes strings, sorts them, and determines the final answer.
 */
function main ( )
{
  n = scan ( ) ; // Read the total number of strings from input.

  // Loop 'n' times to read each string.
  rep ( n , function ( i )
  {
    s [ i ] = scan_string ( ) ; // Store the scanned string in array 's'.
  } ) ; // Finish reading all input strings.


  // Loop 'n' times to simplify each string.
  rep ( n , function ( i )
  {
    p [ i ] = simplify ( s [ i ] ) ; // Simplify string s[i] and store its balance in p[i].
  } ) ; // Finish simplifying all strings.


  // Sort the simplified parenthesis balance pairs based on a custom comparison logic.
  p . sort ( function ( a , b )
  {
    // Calculate difference for element 'a' (open_needed - excess_close).
    var c = a [ 1 ] - a [ 0 ] ;
    // Calculate difference for element 'b' (open_needed - excess_close).
    var d = b [ 1 ] - b [ 0 ] ;

    // Special handling for cases where both strings have excess closing parentheses.
    if ( c < 0 && d < 0 )
    {
      // If both are negative, sort by the number of excess closing parentheses in descending order.
      return b [ 0 ] - a [ 0 ] ;
    }
    // Otherwise, sort primarily by the difference (d - c).
    // This prioritizes strings that can "absorb" more open parentheses (larger d-c).
    return d - c ;
  } ) ; // End of sorting operation.


  var q = 0 ; // 'q' represents the current balance of open parentheses available.
  var ans = true ; // 'ans' tracks whether a valid sequence can be formed.

  // Attempt to process the sorted strings.
  rep ( n , function ( )
  {
    var update = false ; // Flag to check if any string was successfully processed in this iteration.

    // Iterate through the simplified pairs.
    rep ( n , function ( i )
    {
      // Check if the current pair 'p[i]' is still valid (not null)
      // and if the current open balance 'q' can cover its excess closing parentheses.
      if ( p [ i ] !== null && q >= p [ i ] [ 0 ] )
      {
        // Update the current balance 'q' by adding the net change from this string.
        q += ( p [ i ] [ 1 ] - p [ i ] [ 0 ] ) ; // Add net balance of current string.
        p [ i ] = null ; // Mark this string as processed.
        update = true ; // Indicate that an update occurred.
        return false ; // Break from this inner loop (rep(n, function(i))).
      }
    } ) ; // End of inner loop for processing pairs.

    // If no string could be processed in this iteration, it means a valid sequence cannot be formed.
    if ( ! update )
    {
      ans = false ; // Set answer to false.
      return false ; // Break from the outer loop (rep(n, function())).
    }
  } ) ; // End of outer loop for processing strings.

  // Print the final result: 'Yes' if all strings were processed and the final balance is zero, otherwise 'No'.
  print ( ans && q === 0 ? 'Yes' : 'No' ) ;
} // End of main function.


/*
 * A general purpose repetition function.
 * It's a flexible loop that can iterate from 0 to 'a', or from 'a' to 'b'.
 *
 * @param {number} a - If 'c' is undefined, this is the upper limit (exclusive).
 *                     Otherwise, it's the starting index (inclusive).
 * @param {function|number} b - If 'c' is undefined, this is the callback function.
 *                              Otherwise, it's the upper limit (exclusive).
 * @param {function} [c] - The callback function to execute for each iteration.
 *                         It receives the current index 'i' as an argument.
 *                         If the callback returns 'false', the loop breaks.
 */
function rep ( a , b , c )
{
  // Check if the 'c' argument (callback) is missing.
  if ( c === undefined )
  {
    c = b ; // If 'c' is undefined, 'b' is the callback.
    b = a ; // And 'a' is the upper limit.
    a = 0 ; // The loop should start from 0.
  }

  // Standard for loop iteration.
  for ( var i = a ; i < b ; ++ i )
  {
    // Execute the callback function. If it returns false, break the loop.
    if ( c ( i ) === false )
    {
      break ; // Exit the loop prematurely.
    }
  }
} // End of rep function.


// Initialize standard input handling.
process . stdin . resume ( ) ; // Ensures the stdin stream is open.
process . stdin . setEncoding ( 'utf8' ) ; // Sets the encoding for input data.


var input = '' ; // Buffer to accumulate all incoming standard input data.
var input_index = 0 ; // Pointer to the current position in the processed input array.


/**
 * Reads a single number from the processed input array.
 * Assumes input has been split and parsed into numbers.
 *
 * @returns {number} The next number from the input.
 */
function scan ( )
{
  return + input [ input_index ++ ] ; // Convert the string element to a number and advance index.
} // End of scan function.


/**
 * Reads a single string from the processed input array.
 * Assumes input has been split.
 *
 * @returns {string} The next string from the input.
 */
function scan_string ( )
{
  return input [ input_index ++ ] ; // Return the string element and advance index.
} // End of scan_string function.


/**
 * Prints a value to the standard output.
 *
 * @param {*} val - The value to be printed.
 */
function print ( val )
{
  console . log ( val ) ; // Use console.log for output.
} // End of print function.


// Event handler for 'data' chunks coming from standard input.
process . stdin . on ( 'data' , function ( chunk )
{
  input += chunk ; // Append the received chunk to the input buffer.
} ) ; // End of data event handler.

// Event handler for the 'end' of standard input stream.
process . stdin . on ( 'end' , function ( )
{
  // Trim whitespace from the accumulated input and split it by any whitespace characters.
  input = input . trim ( ) . split ( /\s+/ ) ;
  main ( ) ; // Call the main function to start program execution.
} ) ; // End of end event handler.