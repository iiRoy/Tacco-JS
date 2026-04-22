function ProcessContent (incomingText) {
  // Break down the received string into individual lines
  let parsedLines = incomingText.split('\n');

  // Extract numerical values from the first line
  const [ totalItemsRaw, requiredItemsRaw ] = parsedLines[0].split(' ');
  const totalItems = parseInt(totalItemsRaw, 10);
  const requiredItems = parseInt(requiredItemsRaw, 10);

  // Initialize the decision message
  let finalVerdict = "NO";

  // Evaluate the condition based on item counts
  if (Math.ceil(totalItems / 2) >= requiredItems) {
    finalVerdict = "YES";
  }

  // Output the final decision string
  console.log('%s', finalVerdict);
}

// This utility function is for local testing environments, simulating user input.
function PerformTest() {
  const testInputData = document.querySelector('#input').value;
  ProcessContent(testInputData);
}

// Execute the primary logic by reading from standard input in a Node.js environment
ProcessContent( require('fs').readFileSync('/dev/stdin', 'utf8') );