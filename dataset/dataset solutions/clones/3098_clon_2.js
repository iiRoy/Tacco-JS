// This module addresses a bioinformatics sequence analysis task.
function processSequenceChallenge ( rawInputText )
{
  /*
   * Split the entire input block into individual lines.
   * Assuming the problem input provides one line relevant to the sequence.
   */
  var inputLines = rawInputText . split ( '\n' ) ;

  // Extract the primary sequence string from the first line.
  var targetString = inputLines [ 0 ] ;

  // Convert the target string into an array of its constituent characters.
  var charArray = targetString . split ( '' ) ;

  // Define the set of valid DNA nucleotide bases for comparison.
  var validBases = [ 'A' , 'C' , 'G' , 'T' ] ;

  // Initialize a variable to store the maximum length of a valid subsequence found.
  var maximumLength = 0 ;

  // Initialize a variable to track the length of the current consecutive valid subsequence.
  var currentRunLength = 0 ;

  // Iterate through each character of the sequence array.
  for ( var idx = 0 ; idx < charArray . length ; idx ++ )
  {
    // Check if the current character is one of the valid DNA bases.
    if ( validBases . indexOf ( charArray [ idx ] ) >= 0 )
    {
      // If it's a valid base, increment the current run length
      // and update the maximum length if the current run is longer.
      currentRunLength ++ ;
      maximumLength = Math . max ( maximumLength , currentRunLength ) ;
    }
    else
    {
      // If the character is not a valid base, reset the current run length.
      currentRunLength = 0 ;
    }
  }

  // Output the final calculated maximum length to the console.
  console . log ( maximumLength ) ;
}

// Invoke the main processing function with data read from standard input.
processSequenceChallenge ( require ( 'node:fs' ) . readFileSync ( '/dev/fd/0' , 'utf-8' ) ) ;