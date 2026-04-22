/*
 * This module processes input data to generate ASCII art frames.
 * Each line of input is expected to contain two space-separated numbers,
 * representing width and height for a frame.
 */
(function (inputDataString) {

  // The raw input string is split into individual lines.
  var linesArray = inputDataString.split('\n');

  // This array will store parsed coordinate pairs (width, height) for each line.
  var parsedCoordinates = [];

  // Loop through each line of the input to generate a frame.
  for (var lineIdx = 0, totalLines = linesArray.length; lineIdx < totalLines; lineIdx++) {

    // Split the current line by space to get individual coordinate values.
    parsedCoordinates[lineIdx] = linesArray[lineIdx].split(' ');

    // Convert the first value to an integer for width.
    var frameWidth = parsedCoordinates[lineIdx][0] - 0;
    // Convert the second value to an integer for height.
    var frameHeight = parsedCoordinates[lineIdx][1] - 0;

    // If both width and height are zero, it signals the end of input or an invalid frame.
    if (frameWidth === 0 && frameHeight === 0) {
      return; // Terminate execution.
    }

    // Generate the top and bottom border string (e.g., "###\n").
    // It's a row of '#' characters, length `frameWidth + 1`.
    var horizontalEdge = new Array(frameWidth + 1).join('#') + '\n';

    // Generate the pattern for an internal row (e.g., "#.#\n").
    // It consists of '#' at ends and '.' in between, length `frameWidth - 1` for dots.
    var internalRowPattern = '#' + (new Array(frameWidth - 1).join('.') + '#') + '\n';

    // Assemble the full ASCII art frame.
    // It starts with the top border, followed by `frameHeight - 1` internal rows,
    // then the bottom border, and an extra newline at the end.
    var outputBlock = horizontalEdge + (new Array(frameHeight - 1).join(internalRowPattern)) + horizontalEdge + '\n';

    // Print the generated frame to the console.
    console.log(outputBlock);
  }
}(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read input from standard input using Node.js fs module.