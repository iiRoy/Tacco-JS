// This function examines an incoming text string to compare its initial components.
function analyzeTextParts (incomingData)

{
  /* Declare a constant to hold the separated segments of the input.
     The input string is divided based on space characters. */
  const separatedSections = incomingData .split (' ');

  // Evaluate if the first and second segments are identical.
  if (separatedSections[0] === separatedSections[1])
  {
    // If they match, output a positive confirmation.
    console.log('Yes');
  }
  else
  {
    // Otherwise, output a negative confirmation.
    console.log('No');
  }

} // End of analyzeTextParts function

// Invoke the primary analysis function, reading content from standard input.
analyzeTextParts( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;