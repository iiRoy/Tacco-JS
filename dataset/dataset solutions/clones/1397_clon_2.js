// This self-executing function processes incoming text data from a stream.
(function(dataStream) {

  // A helper function to safely interpret a string as JavaScript code.
  // This maintains the original functionality of dynamic code execution.
  const executeCodeString = (codeFragment) => eval(codeFragment);

  // First, divide the entire input data into an array of distinct lines.
  let lineArray = dataStream.split('\n');

  // Iterate over each individual line identified in the input array.
  for (let lineIndex = 0; lineIndex < lineArray.length; lineIndex++) {
    // Extract the current line for processing in this iteration.
    const currentLine = lineArray[lineIndex];

    // Check if the current line contains a specific termination character.
    // If the query mark is found, processing must cease immediately.
    if (currentLine.includes('?')) {
      return; // Exit the anonymous function early.
    }

    // Execute the code represented by the current line and output its result.
    // The result is converted to a string and a newline is appended for clarity.
    process.stdout.write(String(executeCodeString(currentLine)) + '\n');
  }

})(require('node:fs').readFileSync('/dev/stdin', 'utf8')); // The function immediately executes, reading its input from stdin.