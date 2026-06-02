let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

const handleIncomingData = (dataChunk) => {
  rawInputBuffer += dataChunk;
};

const processInputAndRun = () => {
  const inputLines = rawInputBuffer.split('\n');
  executeProgramCore(inputLines);
};

process.stdin.on('data', handleIncomingData);
process.stdin.on('end', processInputAndRun);

const digitToCharMap = [
  [],
  ['.', ' ,' , '!' , '?', ' '],
  ['a', 'b', 'c'],
  ['d', 'e', 'f'],
  ['g', 'h', 'i'],
  ['j', 'k', 'l'],
  ['m', 'n', 'o'],
  ['p', 'q', 'r', 's'],
  ['t', 'u', 'v'],
  ['w', 'x', 'y', 'z']
];

function interpretKeypadSequence(inputSequence) {
  if (!inputSequence) {
    return '';
  }

  let decodedOutput = '';
  let currentDigit = '';
  let consecutivePresses = 0;

  const ZERO_KEY_INDICATOR = '0';
  const PRESS_COUNT_ADJUSTMENT = 1;

  for (let charIndex = 0; charIndex < inputSequence.length; charIndex++) {
    const currentChar = inputSequence[charIndex];

    if (currentChar === ZERO_KEY_INDICATOR) {
      if (consecutivePresses > 0) {
        const digitValue = parseInt(currentDigit, 10);
        const charOptions = digitToCharMap[digitValue];
        const selectedCharIndex = (consecutivePresses - PRESS_COUNT_ADJUSTMENT) % charOptions.length;
        decodedOutput += charOptions[selectedCharIndex];
      }
      consecutivePresses = 0;
      currentDigit = '';
    } else {
      if (currentChar === currentDigit) {
        consecutivePresses++;
      } else {
        currentDigit = currentChar;
        consecutivePresses = 1;
      }
    }
  }
  return decodedOutput;
}

function executeProgramCore(inputLines) {
  const numberOfTestCases = parseInt(inputLines[0], 10);

  const processSingleTestCase = (caseData) => {
    const result = interpretKeypadSequence(caseData);
    console.log(result);
  };

  for (let caseIndex = 0; caseIndex < numberOfTestCases; caseIndex++) {
    const currentInputSequence = inputLines[caseIndex + 1];
    processSingleTestCase(currentInputSequence);
  }
}
