const charCodeA = 'a'.charCodeAt(0);
const charCodeT = 't'.charCodeAt(0);
const charCodeZ = 'z'.charCodeAt(0);
const alphabetSize = 26;

const precomputedOffsetMap = (() => {
  const offsetMapping = new Map();
  let currentOffsetValue = 0;

  // Map 't' through 'z'
  for (let i = 0; i < alphabetSize; i++) {
    const char = String.fromCharCode(charCodeT + i);
    if (char.charCodeAt(0) <= charCodeZ) {
      offsetMapping.set(char, currentOffsetValue++);
    } else {
      // Break if we go past 'z' (e.g., if charCodeT + i > charCodeZ)
      break;
    }
  }

  // Map 's' down to 'a'
  for (let i = charCodeT - 1; i >= charCodeA; i--) {
    const char = String.fromCharCode(i);
    offsetMapping.set(char, currentOffsetValue++);
  }
  return offsetMapping;
})();

const characterDecrypter = (charToDecrypt, shiftVal) => {
  if (charToDecrypt === ' ' || charToDecrypt === '.') {
    return charToDecrypt;
  }

  const currentCode = charToDecrypt.charCodeAt(0);
  const shiftedCode = currentCode - shiftVal;

  return String.fromCharCode(shiftedCode > charCodeZ ? charCodeA + (shiftedCode - charCodeZ) : shiftedCode);
};

const determineCipherOffsetViaMap = (referenceChar) => {
  return precomputedOffsetMap.get(referenceChar[0]);
};

const applyTransformation = (textString, shiftValue) => {
  return Array.from(textString).reduce((accumulator, char) => {
    return accumulator + characterDecrypter(char, shiftValue);
  }, '');
};

const executeCipherLogic = (inputLines) => {
  inputLines.forEach(currentLine => {
    const lineContent = currentLine.trim();
    if (lineContent.length === 0) {
      return;
    }

    const wordSegments = currentLine.split(/[ \.]/g);
    const knownDecryptedWords = new Set(['the', 'this', 'that']);

    let activeShift = 0;
    let shiftFoundAndSet = false;

    wordSegments.some(segment => {
      if (segment.length === 0) {
        return false;
      }

      const potentialShift = determineCipherOffsetViaMap(segment);
      const decryptedSegment = applyTransformation(segment, potentialShift);

      if (knownDecryptedWords.has(decryptedSegment)) {
        activeShift = potentialShift;
        shiftFoundAndSet = true;
        return true;
      }
      activeShift = potentialShift;
      return false;
    });

    console.log(applyTransformation(currentLine, activeShift));
  });
};

let receivedInputData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  receivedInputData += chunk;
});
process.stdin.on('end', () => {
  const linesToProcess = receivedInputData.split('\n');
  executeCipherLogic(linesToProcess);
});
