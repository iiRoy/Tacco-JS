// Main function definition begins here. This function processes the entire input.
function Main( input )
{

  // The input is a single string; it's split into an array of lines based on the newline character.
  input = input.split( '\n' );


  // The first element of the input array (input[0]) is parsed as an integer 'n'.
  // 'n' typically represents the number of data lines that follow.
  var n = Number( input[0] );

  // An empty array named 'str' is initialized. This array will store processed character arrays.
  var str = [];


  // A loop iterates from i = 1 up to n (inclusive).
  // This means it processes 'n' lines of input, starting from the second line.
  for ( var i = 1; i < n + 1; i++ )
  {
    // For each input line (input[i]):
    // 1. It's converted into an array of its individual characters using [].slice.call().
    // 2. This character array is then sorted alphabetically.
    // 3. The resulting sorted character array is pushed into the 'str' array.
    str.push( [].slice.call( input[i] ).sort() );
  }


  // An 'output' variable is declared and initialized as an empty string.
  // In this particular implementation, 'output' is not used later.
  var output = '';

  // The first element is removed from the 'str' array (which contains sorted character arrays)
  // and assigned to the 'base' variable. This 'base' will be the initial set of characters
  // against which subsequent arrays will be compared.
  var base = str.shift();


  /**
   * This is a recursive helper function named 'arr'.
   * Its purpose is to find the common characters present in all arrays within the 'str' parameter,
   * starting with an initial 'base' array.
   * @param {Array<string>} base - The current array of common characters.
   * @param {Array<Array<string>>} str - An array of character arrays yet to be compared.
   * @returns {Array<string>} An array containing characters common to all processed arrays.
   */
  function arr( base, str )
  {
    // Base case for the recursion: If there are no more character arrays left in 'str' to compare,
    // the function returns the current 'base' array, which now contains the common characters.
    if ( str.length === 0 )
    {
      return base;
    }


    // Get the next character array from the 'str' array. 'shift()' removes it from 'str'.
    var s = str.shift();


    // Initialize an empty array named 'out'. This will temporarily store characters
    // that are common between 'base' and 's' in the current iteration.
    var out = [];

    // Outer loop: Iterate through each character in the 'base' array.
    for ( var i = 0; i < base.length; i++ )
    {
      // Inner loop: For each character in 'base', iterate through each character in 's'.
      for ( var j = 0; j < s.length; j++ )
      {
        // Check if the current character from 'base' matches the current character from 's'.
        if ( base[i] === s[j] )
        {
          // If a match is found:
          // 1. Add the common character to the 'out' array.
          out.push( base[i] );
          // 2. Remove the matched character from 's'. This is crucial to ensure that
          //    each character from 's' is used only once for a match.
          s.splice( j, 1 );
          // 3. Break out of the inner loop. This means that once a character from 'base'
          //    finds a match in 's', we move to the next character in 'base'.
          break;
        }
      }
    }

    // Recursive call: The function calls itself with the newly found common characters ('out')
    // as the new 'base', and the remaining 'str' arrays (which have been modified by 'shift()').
    return arr( out, str );
  }


  // The 'arr' function is called with the initial 'base' and the 'str' array.
  // The final result (an array of common characters) is stored in 'result'.
  var result = arr( base, str );


  // After the recursive process completes, check the length of the 'result' array.
  if ( result.length === 0 )
  {
    // If 'result' is empty, it means no common characters were found across all input strings.
    // In this case, print an empty line to the console.
    console.log();
  }
  else
  {
    // If 'result' contains characters, join them together into a single string
    // and print this string to the console.
    console.log( result.join( '' ) );
  }

} // End of the Main function.


// This line executes the Main function by reading input from standard input.
// It uses Node.js's 'fs' module to synchronously read the content of '/dev/stdin'
// as a UTF-8 encoded string, and then passes this string to the Main function.
Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );