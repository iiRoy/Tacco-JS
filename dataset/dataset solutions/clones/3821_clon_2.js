// This function evaluates a sequence of numeric inputs to determine a specific positional outcome.
function evaluatePositions ( rawInputText )
{
  // Parse the incoming string of space-separated values into an array of integers.
  const parsedNumbers = rawInputText . split ( " " ) . map ( strValue => + strValue ) ;

  // Initialize a variable to hold the final decision, defaulting to a positive state.
  let decisionString = "Yes" ;

  // Check the first critical condition: Is the absolute difference between the first and third
  // elements greater than the fourth element?
  if ( Math . abs ( parsedNumbers [ 0 ] - parsedNumbers [ 2 ] ) > parsedNumbers [ 3 ] )

    // If the first condition is met, proceed to check a secondary set of conditions.
    // This involves comparing the absolute differences of the first and second,
    // and the third and second elements against the fourth element.
    if ( Math . abs ( parsedNumbers [ 0 ] - parsedNumbers [ 1 ] ) > parsedNumbers [ 3 ] ||
         Math . abs ( parsedNumbers [ 2 ] - parsedNumbers [ 1 ] ) > parsedNumbers [ 3 ] )
    {
      // If either of these secondary conditions holds true, the decision is negative.
      decisionString = "No" ;
    }

  // Display the final determined status to the standard output.
  console . log ( decisionString ) ;
}


// Read the entire content from standard input synchronously using Node.js 'fs' module,
// interpreting it as UTF-8, and then pass it to our evaluation function.
evaluatePositions ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;