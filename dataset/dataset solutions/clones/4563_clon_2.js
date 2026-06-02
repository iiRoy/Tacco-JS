'use strict';

// This function takes raw text data as input and formats it into a framed output.
function processInput(rawData) {
  // First, the entire raw data string is split into an array of strings,
  // where each element represents a line from the original input.
  let processedLines = rawData.split('\n');

  // The very first line of the input (at index 0) is expected to contain
  // two space-separated numbers representing dimensions.
  // This line is split by spaces, and each resulting string is converted
  // into an integer using the bitwise NOT operator twice (~~).
  processedLines[0] = processedLines[0].split(' ').map(numericString => ~~numericString);

  // Extract the height and width values from the parsed first line.
  const frameHeight = processedLines[0][0];
  const frameWidth = processedLines[0][1];

  // Initialize a mutable string buffer that will accumulate the final output.
  // The top border is created by repeating the '#' character for a length
  // equal to the frame width plus two (for the left and right border characters),
  // followed by a newline character.
  let outputAccumulator = '#'.repeat(frameWidth + 2) + '\n';

  // Iterate through the content lines of the input.
  // The loop starts from the second line (index 1) up to and including
  // the line corresponding to the specified frame height.
  for (let lineIndex = 1; lineIndex <= frameHeight; lineIndex++) {
    // For each content line, append a '#' character (left border),
    // then the actual content from the processed lines array,
    // then another '#' character (right border), followed by a newline.
    outputAccumulator += '#' + processedLines[lineIndex] + '#\n';
  }

  // After processing all content lines, append the bottom border.
  // This is identical in structure to the top border.
  outputAccumulator += '#'.repeat(frameWidth + 2);

  // Finally, print the complete framed string to the standard output.
  console.log(outputAccumulator);
}

// The program execution starts here.
// It reads the entire content of the standard input file ("/dev/stdin")
// as a UTF-8 encoded string and passes it to the 'processInput' function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
