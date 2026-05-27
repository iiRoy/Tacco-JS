let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  rawInputBuffer += chunk;
});

process.stdin.on('end', () => {
  const processedInputLines = rawInputBuffer.split('\n');
  executeMainLogic(processedInputLines);
});

const keyMap = Object.freeze([
  [],
  ['.', ',', '!', '?', ' '],
  ['a', 'b', 'c'],
  ['d', 'e', 'f'],
  ['g', 'h', 'i'],
  ['j', 'k', 'l'],
  ['m', 'n', 'o'],
  ['p', 'q', 'r', 's'],
  ['t', 'u', 'v'],
  ['w', 'x', 'y', 'z']
]);

function decodeSequence(inputSequence) {
  let decodedMessage = '';
  let currentKey = '';
  let pressCount = 0;

  const sequenceLength = inputSequence.length;

  const appendCharacterFromKey = () => {
    if (pressCount === 0) {
      return;
    }
    const keyIdentifier = Number(currentKey);
    const availableChars = keyMap[keyIdentifier];
    const charSelectionIndex = (pressCount - 1) % availableChars.length;
    decodedMessage += availableChars[charSelectionIndex];
  };

  for (let charIndex = 0; charIndex < sequenceLength; charIndex++) {
    const currentChar = inputSequence[charIndex];

    if (currentChar === '0') {
      appendCharacterFromKey();
      pressCount = 0;
    } else {
      currentKey = currentChar;
      pressCount++;
    }
  }
  return decodedMessage;
}

function executeMainLogic(processedInputLines) {
  const numCases = Number(processedInputLines[0]);

  const processAndLogCase = (caseNumber) => {
    const inputLineForCase = processedInputLines[caseNumber + 1];
    const resultString = decodeSequence(inputLineForCase);
    console.log(resultString);
  };

  for (let caseIndex = 0; caseIndex < numCases; caseIndex++) {
    processAndLogCase(caseIndex);
  }
}
