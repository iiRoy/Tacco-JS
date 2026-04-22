// Solution for Problem ABC-Checker
function processInputData(rawData)
{
  const linesOfText = rawData.split('\n'); // Split the entire input into individual lines
  const totalElements = Number.parseInt(linesOfText[0], 10); // Parse the first line as an integer for length (unused, but kept for structural fidelity)
  let targetString = linesOfText[1]; // The actual string to be processed is on the second line

  // Append a special sequence to simplify boundary conditions for pattern matching
  targetString += '\u0058\u0058'; // Appending 'XX' using Unicode literals

  const characterSequence = Array.from(targetString); // Convert the string into an array of characters

  let occurrenceCount = 0; // Initialize a variable to count the occurrences of the 'ABC' pattern

  // Iterate through the character sequence, stopping two characters before the end to allow for 'ABC' check
  for (let currentPos = 0; currentPos < characterSequence.length - 2; ++currentPos)
  {
    // Check if the character at the current position is 'A'
    if (characterSequence[currentPos] === '\u0041') // Using Unicode literal for 'A'
    {
      // If it's 'A', then proceed to check for 'B' and 'C' in the subsequent two positions
      occurrenceCount += (characterSequence[currentPos + 1] === '\u0042' && characterSequence[currentPos + 2] === '\u0043') ? 1 : 0; // Using Unicode literals for 'B' and 'C'
    }
  }

  console.log(occurrenceCount); // Output the final aggregated count of 'ABC' sequence detections
}

// Invoke the primary data processing function with content obtained from standard input
processInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );