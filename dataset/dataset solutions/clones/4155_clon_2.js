/*
 * This self-executing function processes input data
 * according to specific sorting rules and then performs
 * a comparison on the results.
 */
(
  function ( sourceContent )
  {
    // The main processing logic for the input string.
    // It splits the input into lines and transforms each line.
    sourceContent = sourceContent
      .split( '\n' ) // Break the monolithic input string into an array of individual lines.
      .map( ( currentLine, linePosition ) => { // Iterate over each line with its index.
        let charactersArray = currentLine.split(''); // Convert the current line string into an array of its constituent characters.

        // Apply a conditional sorting logic based on the line's sequential position.
        if ( linePosition ) {
          // For any line beyond the very first one (i.e., linePosition is truthy),
          // sort its characters in ascending lexicographical order.
          return charactersArray.sort().join('');
        } else {
          // For the initial line (linePosition is 0, thus falsy),
          // sort its characters in descending lexicographical order.
          return charactersArray.sort().reverse().join('');
        }
      });

    // Output the resulting array of processed strings to the standard output stream.
    // This allows for inspection of the intermediate data transformation.
    console.log( sourceContent );

    // Perform a final comparison between the first two processed strings.
    // This is a standard lexicographical string comparison.
    // If the first element is "greater than" the second, print 'Yes', otherwise print 'No'.
    console.log( sourceContent[0] > sourceContent[1] ? 'Yes' : 'No' );
  }
)(
  require("fs").readFileSync( "/dev/stdin", "utf8" ) // Read all content from standard input as a UTF-8 string.
);