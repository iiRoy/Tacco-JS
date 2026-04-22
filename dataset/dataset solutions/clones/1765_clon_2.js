// This function processes incoming textual information.
function ProcessInputData(sourceText) {
  // The raw data is initially divided into separate lines.
  sourceText = sourceText.split('\n');

  // The very first line is then further broken down into individual components, using space as the primary delimiter.
  let firstLineTokens = sourceText[0].split(' ');

  // A variable is declared to store the identified index, initialized as an empty string.
  let targetPosition = '';

  // A loop iterates through the initial five elements of the tokenized first line.
  for (let currentIdx = 0; currentIdx < 5; currentIdx++) {
    // If any element within this range is found to be '0', its corresponding index is recorded.
    if (firstLineTokens[currentIdx] == 0) {
      targetPosition = currentIdx;
    }
  }

  // The recorded index is converted to an integer, incremented by one, and subsequently displayed to the console.
  console.log(parseInt(targetPosition) + 1);
}

// The main processing function is invoked with data acquired by reading the content of the standard input file.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));