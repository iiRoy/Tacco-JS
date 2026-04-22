const renderMessage = console.log; // Utility for printing messages to the console.

/*
 * Fetches all lines of content from standard input,
 * treating them as UTF-8 encoded text.
 * The input is then parsed into an array of strings,
 * where each element represents a line.
 */
const inputDataRows = require('fs')
                        .readFileSync(0, 'utf8')
                        .split('\n');

// The first row of input contains configuration values: height and width.
// These are extracted and converted to numerical types.
const configurationNumbers = inputDataRows[0]
                               .split(' ')
                               .map(Number);

// The first configuration number represents the height of the content area.
const contentHeight = configurationNumbers[0];

// The second configuration number represents the width of the content area.
const contentWidth = configurationNumbers[1];

// A decorative boundary string is created for the top and bottom of the frame.
// It consists of '#' characters, with two extra for the side borders.
const frameEdgeString = '#'.repeat(contentWidth + 2);

// Output the top border of the frame.
renderMessage(frameEdgeString);

// Loop through each line of the actual content, starting from the second input row.
// The content lines are wrapped with '#' characters on both sides to form the frame.
for (
  let currentIndex = 1;
  currentIndex <= contentHeight;
) {
  renderMessage(
    '#'
    +
    inputDataRows[currentIndex++]
    +
    '#'
  );
}

// Output the bottom border of the frame.
renderMessage(frameEdgeString);