var inputLines = [];

var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

lineReader.on('close', function() {
  const wordCountLimit = parseInt(inputLines[0], 10);
  const processedWords = inputLines.slice(1, wordCountLimit);

  const finalState = processedWords.reduce((accumulator, currentWordString) => {
    if (accumulator.hasFailed) {
      return accumulator;
    }

    const cleanedWord = currentWordString.replace(/\r?\n/g, "");
    const wordWithoutFirstChar = cleanedWord.slice(1);

    if (wordWithoutFirstChar === accumulator.previousCharTracker) {
      return {
        previousCharTracker: accumulator.previousCharTracker,
        hasFailed: true
      };
    } else {
      return {
        previousCharTracker: cleanedWord.slice(-1),
        hasFailed: false
      };
    }
  }, { previousCharTracker: "", hasFailed: false });

  console.log(finalState.hasFailed ? "No" : "Yes");
});
