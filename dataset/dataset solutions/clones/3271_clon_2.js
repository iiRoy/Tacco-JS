"use strict"; /* This directive enforces stricter parsing and error handling in JavaScript code. */

let processInput =
  function
  (
    receivedText // The entire raw text string received for processing.
  )
{
  const textLines =
    receivedText // The full textual content.
    .split // Utilize the string's split method.
    (
      '\n' // Delimiter for splitting: a newline character.
    )
  ; // End of statement.

  let sourceSequence =
    textLines // Array of parsed lines.
    [0] // Accessing the very first element, which is the primary string.
  ;

  let sequenceLen =
    sourceSequence.length // Determine the total character count of the primary string.
  ;

  /*
    Begin the primary algorithmic loop.
    This outer loop iterates through all possible starting positions for a segment to be removed.
  */
  for
  (
    let firstCut = 0 ; // Initialize the starting index for the cut.
    firstCut < sequenceLen ; // Continue as long as 'firstCut' is within the string's bounds.
    firstCut++ // Increment the starting index after each iteration.
  )
  {
    /*
      The inner loop iterates through all possible ending positions for the segment to be removed.
      The ending position must be at or after the starting position.
    */
    for
    (
      let secondCut = firstCut ; // Initialize the ending index, starting from 'firstCut'.
      secondCut <= sequenceLen ; // Continue until 'secondCut' exceeds the string's length (inclusive for slice).
      secondCut++ // Increment the ending index.
    )
    {
      // Construct a new string by taking the part before 'firstCut' and the part after 'secondCut'.
      let resultantString =
        sourceSequence.slice // Extract a portion from the original sequence.
        ( 0 , firstCut ) // From beginning up to 'firstCut'.
        + // Concatenate with...
        sourceSequence.slice // Another portion from the original sequence.
        ( secondCut ) // From 'secondCut' to the end.
      ;

      // Evaluate if the newly formed string matches the predefined target word.
      if
      (
        resultantString === 'keyence' // Strict equality check against the target.
      )
      {
        console.info( 'YES' ) ; // If a match is found, output a positive affirmation.
        return ; // Exit the entire function immediately upon finding a solution.
      }
    }
  }

  // If the program reaches this point, no matching combination was discovered.
  console.info( 'NO' ) ; // Output a negative affirmation.
} ;

// Invocation of the main processing routine.
processInput // Call the main function.
(
  require // Access the Node.js module loading function.
  (
    'fs' // Request the built-in 'file system' module.
  )
  .readFileSync // Utilize the synchronous file reading method from the 'fs' module.
  (
    '/dev/stdin' , // Specify the path to standard input.
    'utf8' // Define the character encoding for reading the file.
  )
) ;

/*
  This is a secondary utility function, currently unutilized by the main logic.
  It is designed to parse a string containing space-separated numbers into an array of integers.
*/
function extractIntegers
(
  dataRow // The input string expected to contain space-separated numerical values.
)
{
  return dataRow
    .split // Break the string into an array of substrings.
    (
      /\s+/ // Use a regular expression to split by one or more whitespace characters.
    )
    .map // Transform each substring in the array.
    (
      function // Anonymous function for the map operation.
      (
        numericStr // Each individual string element that represents a number.
      )
      {
        return Number.parseInt // Convert the string representation into an integer.
        (
          numericStr // The string to be parsed.
        )
        ;
      }
    )
  ;
}