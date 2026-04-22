// All incoming information is stored within the provided string
function ProcessInput(incomingText) {
  // The first line is incomingText[0], second is incomingText[1], etc.
  // incomingText = incomingText.split("\n");

  let textLength = incomingText.length;

  const resultString = incomingText.substring(0, textLength - 8);
  // Display the outcome
  console.log('%s', resultString);
}

// This function activates when the "Execute" button is pressed (for debugging purposes)
function performTest () {
  let testData = document.getElementById('dataEntry').value;
  ProcessInput(testData);
}

// * Do not modify anything beyond this point (reads from standard I/O and invokes the primary function)
ProcessInput( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );