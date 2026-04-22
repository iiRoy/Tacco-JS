function
main ( lines )
{
  /*
   * This function is designed to process an array of text lines
   * and compute the frequency of each lowercase English alphabet character.
   *
   * @param {Array<string>} lines - An array of strings, where each string is a line of text.
   */

  var charCounts = { } ; // Initialize an empty object to store character counts.


  // Loop through all lowercase English alphabet characters from 'a' to 'z'.
  // We use charCodeAt(0) to get the ASCII value for 'a' and 'z'.
  for ( var code = 'a'.charCodeAt(0) ; code <= 'z'.charCodeAt(0) ; code++ )
  {
    // For each character, convert its ASCII code back to a string
    // and initialize its count in the charCounts object to 0.
    charCounts[String.fromCharCode(code)] = 0 ;
  }


  // Iterate over each line provided in the 'lines' array.
  for ( var i = 0 ; i < lines.length ; i++ )
  {
    // Convert the current line to lowercase to ensure case-insensitive counting.
    // This step standardizes the characters for counting.
    var chars = lines[i].toLowerCase() ;
    // Loop through each character in the current (lowercase) line.
    // Note: The loop condition 'li <= chars.length' includes an out-of-bounds access for chars[chars.length].
    // This will result in charCounts[undefined] being incremented, potentially leading to NaN if not handled.
    // However, as per Type I cloning rules, this exact logic must be preserved.
    for ( var li = 0 ; li <= chars.length ; li++ )
    {
      // Increment the count for the current character found in the line.
      // If chars[li] is undefined (from the loop condition), charCounts[undefined] will be affected.
      charCounts[chars[li]]++ ;
    }
  }


  // After processing all input lines, print the final counts
  // for each lowercase English alphabet character.
  for ( var code = 'a'.charCodeAt(0) ; code <= 'z'.charCodeAt(0) ; code++ )
  {
    var char = String.fromCharCode(code) ; // Get the actual character from its ASCII code.
    // Output the character and its corresponding frequency, formatted as "char : count".
    console.log(char + ' : ' + charCounts[char]) ;
  }
}


// Global variables and event handlers for processing standard input.
var chunks = [ ] ; // An array to accumulate data chunks received from standard input.

// Attach an event listener for 'data' events on the standard input stream.
// This function will be called whenever new data is available.
process.stdin.on(
  'data' ,
  function ( chunk )
  {
    // Each received 'chunk' is pushed into the 'chunks' array.
    chunks.push(chunk) ;
  }
) ;

// Attach an event listener for the 'end' event on the standard input stream.
// This function will be called once all input has been received.
process.stdin.on(
  'end' ,
  function ( )
  {
    // When the input stream ends, join all collected chunks into a single string.
    // Then, split this string by newline characters to get an array of individual lines.
    var lines = chunks.join('').split('\n') ;
    // Finally, call the main processing function with the collected lines.
    main(lines) ;
  }
) ;