const symbolMap = {
  '1': ['.', ' ,' , '!' , '?', ' '],
  '2': ['a', 'b', 'c'],
  '3': ['d', 'e', 'f'],
  '4': ['g', 'h', 'i'],
  '5': ['j', 'k', 'l'],
  '6': ['m', 'n', 'o'],
  '7': ['p', 'q', 'r', 's'],
  '8': ['t', 'u', 'v'],
  '9': ['w', 'x', 'y', 'z']
};

const decodeSequence = (inputString) => {
  const initialAccumulator = { currentSentence: '', lastCharPressed: null, pressTally: 0 };

  const finalState = inputString.split('').reduce((acc, currentCharacter) => {
    if (currentCharacter === '0') {
      if (acc.pressTally > 0) {
        const correspondingChars = symbolMap[acc.lastCharPressed];
        if (correspondingChars) {
          acc.currentSentence += correspondingChars[(acc.pressTally - 1) % correspondingChars.length];
        }
      }
      acc.lastCharPressed = null;
      acc.pressTally = 0;
    } else {
      acc.lastCharPressed = currentCharacter;
      acc.pressTally++;
    }
    return acc;
  }, initialAccumulator);

  return finalState.currentSentence;
};

const retrieveInputLines = async () => {
  return new Promise((resolve) => {
    const gatheredLines = [];
    const streamProcessor = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    streamProcessor.on('line', (individualLine) => {
      gatheredLines.push(individualLine);
    });

    streamProcessor.on('close', () => {
      resolve(gatheredLines);
    });
  });
};

const provideOutput = (message) => {
  process.stdout.write(message + '\n');
};

const executeMainLogic = async () => {
  const receivedLines = await retrieveInputLines();
  const testCaseCount = parseInt(receivedLines[0], 10);

  for (let caseIndex = 0; caseIndex < testCaseCount; ++caseIndex) {
    const currentTestInput = receivedLines[caseIndex + 1];
    const decodedText = decodeSequence(currentTestInput);
    provideOutput(decodedText);
  }
};

executeMainLogic();