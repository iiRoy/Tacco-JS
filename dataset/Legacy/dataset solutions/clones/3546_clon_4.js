var inputLines = [];

var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

lineReader.on('close', function() {
  const wordSequenceLength = parseInt(inputLines[0], 10);
  const wordElements = inputLines.slice(1, wordSequenceLength);

  const processingOutcome = wordElements.reduce((accumulator, currentWordItem) => {
    if (accumulator.problemFound) {
      return accumulator;
    }

    const hasBeenSeen = accumulator.uniqueWords.has(currentWordItem);
    const connectionMismatch = accumulator.previousWordEndingChar !== null &&
                               currentWordItem[0] !== accumulator.previousWordEndingChar;

    if (hasBeenSeen || connectionMismatch) {
      return {
        ...accumulator,
        problemFound: true,
        failingWordItem: currentWordItem
      };
    } else {
      accumulator.uniqueWords.add(currentWordItem);
      return {
        ...accumulator,
        previousWordEndingChar: currentWordItem[currentWordItem.length - 1]
      };
    }
  }, {
    uniqueWords: new Set(),
    previousWordEndingChar: null,
    problemFound: false,
    failingWordItem: null
  });

  if (processingOutcome.problemFound) {
    console.log(processingOutcome.failingWordItem);
    console.log("No");
  } else {
    console.log("Yes");
  }
});
