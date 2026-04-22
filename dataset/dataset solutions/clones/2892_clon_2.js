// This module encapsulates core processing logic for textual data.
function ExecuteLogic(incomingContent)
{
  // First, segment the entire incoming content string into an array of lines.
  const lineFragments = incomingContent.split( '\n' );

  // Extract the very first line and then decompose it into individual characters.
  const symbolSequence = lineFragments[0].split( "" );

  // Initialize a counter specifically for occurrences of a designated character.
  let targetCharacterTally = 0;

  // Iterate through each element in the character sequence.
  for ( let charIndex = 0;
        charIndex < symbolSequence.length;
        charIndex++ )
  {
    // If the current character being examined is 'x', increment the tally.
    if ( symbolSequence[charIndex] === "x" )
    {
      targetCharacterTally++; // Increment for 'x'.
    }
  }

  // Establish a default, unfavorable conclusion string.
  let finalVerdict = "NO";

  // Evaluate the accumulated tally against a predefined threshold.
  if ( targetCharacterTally <= 7 )
  {
    finalVerdict = "YES"; // If the condition is met, update to a favorable conclusion.
  }

  // Display the determined verdict to the standard output stream.
  console.log( '%s', finalVerdict );

  // Return the computed string verdict.
  return finalVerdict;
} // End of the ExecuteLogic routine.


// This supplementary function provides a mechanism for testing and verifying the primary logic.
function VerificationRoutine ( scenarioNumber )
{
  // Acquire the specific test input data from a designated HTML element based on the scenario ID.
  const testData = document.getElementById( "input" + scenarioNumber ).value;

  // Invoke the main logic function with the acquired test data to obtain an outcome.
  const outcomeString = ExecuteLogic( testData );

  // Initialize the test's assessment status to "Wrong Answer".
  let testOutcome = "WA";

  // Compare the actual outcome from our logic against the expected outcome from another HTML element.
  if ( outcomeString === document.getElementById( "output" + scenarioNumber ).value.split( "\n" )[0] )
  {
    testOutcome = "AC"; // If they match, the test is deemed "Accepted".
  }

  // Update the visual representation of the test result within the document.
  document.getElementById( "result" + scenarioNumber ).innerHTML = testOutcome;
}

// The main entry point for execution, reading input from a file system and passing it to the core logic.
ExecuteLogic( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );