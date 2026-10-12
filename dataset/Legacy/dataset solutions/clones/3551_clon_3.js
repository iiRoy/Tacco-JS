let collectedLines = [];

let finalOutputStatus = "Yes";

let previousWordLastCharacter = "";

const standardInput = process.stdin;
const standardOutput = process.stdout;

const inputReader = require('readline').createInterface({
  input: standardInput,
  output: standardOutput
});

inputReader.on('line', function(currentInputLine) {
  collectedLines.push(currentInputLine);
});

inputReader.on('close', function() {
  let wordExistenceTracker = {};

  const numberOfWordsToProcess = parseInt(collectedLines[0], 10);

  for (let wordIndex = 1; wordIndex < numberOfWordsToProcess; wordIndex++) {
    const rawWord = collectedLines[wordIndex];
    const processedWord = rawWord.replace(/\r?\n/g, "");

    const isWordAlreadyTracked = wordExistenceTracker.processedWord !== undefined;
    const doesSecondCharMatchPrevious = processedWord.slice(1) === previousWordLastCharacter;

    if (isWordAlreadyTracked || doesSecondCharMatchPrevious) {
      finalOutputStatus = "No";
      break;
    }

    const currentWordLastCharacter = processedWord.slice(-1);
    previousWordLastCharacter = currentWordLastCharacter;
  }

  console.log(finalOutputStatus);
});
