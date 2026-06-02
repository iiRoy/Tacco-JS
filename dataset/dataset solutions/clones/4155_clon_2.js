( ( processedInput ) => {
  // This function processes the raw input string from standard input.
  processedInput = processedInput
    .split( '\n' ) // Divide the input into an array of strings based on newline characters.
    .map( ( lineContent, lineIndex ) => { // Iterate over each individual line.
      if ( lineIndex === 0 ) { // For the very first line (at index zero).
        return lineContent.split( '' ).sort().reverse().join( '' ); // Split into characters, sort in descending order, then re-join.
      } else { // For all subsequent lines (at indices greater than zero).
        return lineContent.split( '' ).sort().join( '' ); // Split into characters, sort in ascending order, then re-join.
      }
    } );

  console.log( processedInput ); // Output the entire transformed array to the console.

  console.log( processedInput[0] > processedInput[1] ? 'Yes' : 'No' ); // Compare the first two elements of the processed array and print 'Yes' or 'No'.
} )( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
