// This file contains a solution for a specific problem.
// It processes a series of test cases based on input parameters.


// Helper function to process a sequence recursively.
// Parameters:
//  - currentLength: The remaining length of the sequence to process.
//  - currentXORSum: The current accumulated XOR sum.
//  - xorValuesArray: An array of numbers used in XOR operations.
//  - sequenceString: The string defining the sequence operations ('0' or '1').
function processSequence( currentLength , currentXORSum , xorValuesArray , sequenceString )
{
  // Base case: If no more elements to process, check if XOR sum is zero.
  if (currentLength === 0)   return currentXORSum === 0;

  // Retrieve the character corresponding to the current position in the sequence.
  const currentChar = sequenceString[ sequenceString.length - currentLength ];

  // Conditional logic based on the character in the sequence string.
  if ( currentChar === '1' )
  {
    // If '1', perform two recursive calls and combine their results with logical AND.
    // First branch: XOR with the corresponding value from xorValuesArray.
    const resultOne = processSequence( currentLength - 1 , currentXORSum ^ parseInt(xorValuesArray[ sequenceString.length - currentLength ], 10) , xorValuesArray , sequenceString );
    // Second branch: Do not XOR, pass currentXORSum as is.
    const resultTwo = processSequence( currentLength - 1 , currentXORSum , xorValuesArray , sequenceString );
    // Both paths must return true for this branch to be true.
    return resultOne && resultTwo;
  }
  else
  {
    // If '0', perform two recursive calls and combine their results with logical OR.
    // This implies that either path can lead to a valid solution.
    return processSequence( currentLength - 1 , currentXORSum ^ parseInt(xorValuesArray[ sequenceString.length - currentLength ], 10) , xorValuesArray , sequenceString ) ||
           processSequence( currentLength - 1 , currentXORSum , xorValuesArray , sequenceString ) ;
  }
}

// Main execution function that orchestrates the program flow.
// It reads input, parses test cases, and calls the processing function.
function executeProgram( programInput )
{
  // Split the entire input string into individual lines.
  const parsedLines = programInput.split( '\n' );

  // Determine the total number of test cases from the first line.
  const numTestCases = parseInt( parsedLines[0], 10 );

  // Loop through each test case. Each case consists of 3 lines of data.
  for ( let caseIndex = 0 ; caseIndex < numTestCases * 3 ; caseIndex += 3 )
  {
    // Extract parameters for the current test case.
    // The 'N' value, converted to a number.
    const caseNValue = parseInt( parsedLines[ caseIndex + 1 ], 10 );
    // The array 'A', split by spaces.
    const caseAValues = parsedLines[ caseIndex + 2 ].split( ' ' );
    // The sequence string 'S'.
    const caseSString = parsedLines[ caseIndex + 3 ];

    // Invoke the recursive processing function with initial parameters.
    const finalOutcome = processSequence( caseNValue , 0 , caseAValues , caseSString );

    // Output the result as '0' if true, '1' if false.
    console.log( finalOutcome ? '0' : '1' );
  }
}


// Entry point of the program. Reads from standard input and starts execution.
executeProgram( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;