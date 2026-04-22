// This module processes incoming textual information.
function ProcessInputData ( sourceText )
{
  let finalVerdict = 'No'; // Initialize the outcome string.

  // The first line of sourceText becomes sourceText[0], second line sourceText[1], etc.
  sourceText = sourceText . trim ( ) . split ( "\n" ) ; // Normalize input by trimming and splitting into lines.

  // Parse the first line into an array of integers.
  let numericValues = sourceText[0] . split ( ' ' ) . map ( ( currentVal ) => ( Number ( currentVal ) ) ) ;

  // Sort the array of numbers in ascending order.
  numericValues . sort ( ( a , b ) => a - b ) ;

  // Check for specific conditions to determine the verdict.
  if ( numericValues[0] === numericValues[1] )
  {
    if ( numericValues[0] !== numericValues[2] )
    {
      finalVerdict = 'Yes' ;
    }
  }

  if ( numericValues[1] === numericValues[2] )
  {
    if ( numericValues[0] !== numericValues[2] )
    {
      finalVerdict = 'Yes' ;
    }
  }


  // Display the computed result.
  console . log ( finalVerdict ) ;
}

// Do not modify the following section (reads from standard input and invokes the main processing function).
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// Alternatively, for local testing: ProcessInputData(require('fs').readFileSync('./test_data.txt', 'utf-8'));