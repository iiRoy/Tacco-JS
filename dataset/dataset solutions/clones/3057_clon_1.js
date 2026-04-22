/*
 * This JavaScript code defines a 'Main' function designed to solve a problem
 * related to character sequences and block manipulations.
 *
 * The objective is to find the maximum possible length of a continuous
 * segment of '1's that can be achieved by flipping at most 'K' blocks of '0's.
 */
function Main(  input  )
{
  "use strict"; // Enforces stricter parsing and error handling in the code.

  // Split the entire input string by newline characters to obtain an array of individual lines.
  const lines = input.split( "\n" );


  // The first line of input is expected to contain two space-separated integers.
  const line1 = lines[0].split( " " );

  // Parse the first integer from 'line1' as 'n', representing the total length
  // of the character sequence. The radix 10 is specified for parseInt.
  const n = parseInt( line1[0] , 10 );

  // Parse the second integer from 'line1' as 'k', representing the maximum
  // number of '0' blocks that are allowed to be flipped to '1's.
  const k = parseInt( line1[1] , 10 );


  // The second line of input contains the character sequence itself.
  // Split this line into an array of individual characters.
  const chars = lines[1].split( "" );


  // Get the total number of characters in the sequence.
  const count = chars.length;

  // This array will store the lengths of consecutive blocks of identical characters.
  // For example, if the sequence is "110001", 'stands' might become [2, 3, 1].
  const stands = [];

  // These arrays are intended to store the lengths of blocks of '0's and '1's.
  // Note: The logic for populating these arrays within the loop is a direct
  // replication of the original code, even if its specific categorization
  // might seem unconventional for a direct "0-block lengths" vs "1-block lengths" interpretation.
  const stands_0 = [];
  const stands_1 = [];


  let x = 1; // A counter for the length of the current consecutive block.
  let prev = chars[0]; // Stores the previously processed character to detect changes.

  // Iterate through the character array starting from the second character.
  for ( let i = 1;  i < count;  i++ )
  {
    const c = chars[i]; // Get the current character being examined.

    // If the current character is different from the previous one,
    // it signifies the end of a block of identical characters.
    if ( c !== prev )
    {
      // Add the length of the just-finished block ('x') to the 'stands' array.
      stands.push( x );

      // Based on the *current* character 'c', categorize the *previous* block's length.
      // If 'c' is '1', it implies the 'prev' character was '0', so the block that just
      // ended was a '0' block. The original code adds its length to 'stands_1'.
      if ( c === "1" )
      {
        stands_1.push( x );
      }
      else // If 'c' is '0', it implies the 'prev' character was '1', so the block that just
           // ended was a '1' block. The original code adds its length to 'stands_0'.
      {
        stands_0.push( x );
      }

      x = 1; // Reset the counter for the new block that is now starting.
    }
    else
    {
      x++; // If the current character is the same as the previous, increment the block length counter.
    }

    prev = c; // Update 'prev' to the current character for the next iteration.
  }
  // Important note: The last block in the sequence is not added to 'stands', 'stands_0',
  // or 'stands_1' by the loop's logic if the sequence ends with characters
  // identical to the previous one, or if the sequence has only one type of character.
  // This behavior is preserved as per Type I cloning rules.


  // Check if the number of allowed flips ('k') is greater than or equal to
  // the count of '0' blocks recorded in 'stands_0'.
  if ( k >= stands_0.length )
  {
    // If so, all '0' blocks can effectively be flipped to '1's,
    // making the entire sequence a continuous block of '1's.
    console.log( n ); // Output the total length 'n'.
    return;           // Terminate the function as the maximum is 'n'.
  }


  // Calculate 'w', the size of the sliding window used to sum up block lengths.
  // The calculation depends on whether the character sequence starts with '1' or '0'.
  // This 'w' value dictates how many blocks (alternating '1's and '0's) are
  // considered together to form a potentially continuous '1' segment after flips.
  const w = chars[0] === "1" ? k * 2 + 1 : k * 2 + 2;


  // Initialize the sliding window 'ww' with the first 'w' block lengths from 'stands'.
  const ww = stands.slice( 0 , w );

  // Define a concise arrow function to compute the sum of all elements in an array.
  const sum = arr => arr.reduce( ( acc , e ) => acc + e , 0 );


  // Initialize an array 'nums' to store the sum of lengths for each sliding window.
  // The first element is the sum of the initial window 'ww'.
  const nums = [ sum( ww ) ];

  // Store the total number of blocks recorded in 'stands' for loop boundary.
  const stands_count = stands.length;


  // Iterate to slide the window across the 'stands' array.
  for ( let i = w; i < stands_count; i++ )
  {
    ww.shift();         // Remove the block length at the front (oldest) of the window.
    ww.push( stands[i] ); // Add the next block length from 'stands' to the end of the window.
    nums.push( sum( ww ) ); // Calculate and store the sum of the new window configuration.
  }


  // Find the maximum value within the 'nums' array (which contains all window sums).
  // This maximum value represents the longest possible continuous '1' segment.
  // The '%s' format specifier is used for console.log, which will convert the number to a string.
  console.log( '%s' , nums.reduce( ( acc , n ) => acc > n ? acc : n , 0 ) );
}

// This line is standard for competitive programming in Node.js.
// It reads the entire content of standard input synchronously,
// decodes it as UTF-8, and then passes it as an argument to the 'Main' function.
Main( require("fs").readFileSync( "/dev/stdin" , "utf8" ) );