const lowerA = 97;
const lowerT = 116;
const lowerZ = 122;

const targetWordsSet = new Set(['the', 'this', 'that']);

const calculateCharacterShift = (inputCharacter) => {
  let charVal = inputCharacter.codePointAt(0) - lowerT;
  return charVal < 0 ? (lowerZ - lowerT) - charVal : charVal;
};

const applyCharacterTransformation = (charToTransform, shiftValue) => {
  if (charToTransform === ' ' || charToTransform === '.') return charToTransform;
  let charCodeResult = charToTransform.codePointAt(0);
  charCodeResult -= shiftValue;
  return String.fromCodePoint(charCodeResult > lowerZ ? lowerA + charCodeResult - lowerZ : charCodeResult);
};

const customTrim = (inputString) => {
  let start = 0;
  let end = inputString.length - 1;
  while (start <= end && /\s/.test(inputString[start])) {
    start++;
  }
  while (end >= start && /\s/.test(inputString[end])) {
    end--;
  }
  return inputString.substring(start, end + 1);
};

const tokenizeString = (sourceString) => {
  const tokens = [];
  let currentToken = '';
  for (let i = 0; i < sourceString.length; i++) {
    const char = sourceString[i];
    if (char === ' ' || char === '.') {
      tokens.push(currentToken);
      currentToken = '';
    } else {
      currentToken += char;
    }
  }
  tokens.push(currentToken);
  return tokens;
};

const transformString = (sourceString, shiftVal) => {
  let result = '';
  for (let i = 0; i < sourceString.length; i++) {
    result += applyCharacterTransformation(sourceString[i], shiftVal);
  }
  return result;
};

const processInputData = (dataLines) => {
  const processNextLine = (lineIndex) => {
    if (lineIndex >= dataLines.length) {
      return;
    }

    const currentLine = dataLines[lineIndex];
    if (customTrim(currentLine) === '') {
      processNextLine(lineIndex + 1);
      return;
    }

    const wordTokens = tokenizeString(currentLine);
    let finalShift = 0;

    const findShiftRecursive = (tokenIdx) => {
      if (tokenIdx >= wordTokens.length) {
        return;
      }

      const currentToken = wordTokens[tokenIdx];
      if (currentToken.length === 0) {
        findShiftRecursive(tokenIdx + 1);
        return;
      }

      const potentialShift = calculateCharacterShift(currentToken[0]);
      const decipheredWord = transformString(currentToken, potentialShift);

      if (targetWordsSet.has(decipheredWord)) {
        finalShift = potentialShift;
        return;
      }
      findShiftRecursive(tokenIdx + 1);
    };

    findShiftRecursive(0);

    const outputLine = transformString(currentLine, finalShift);
    process.stdout.write(outputLine + '\n');

    processNextLine(lineIndex + 1);
  };

  processNextLine(0);
};

let accumulatedData = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunkPart) => {
  accumulatedData += chunkPart;
});

process.stdin.on('end', () => {
  const separatedLines = accumulatedData.split('\n');
  processInputData(separatedLines);
});