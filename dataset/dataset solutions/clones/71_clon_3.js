let accumulatedInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataChunk) {
  accumulatedInput += dataChunk;
});

process.stdin.on('end', function() {
  const inputLines = accumulatedInput.split('\n');
  processInputData(inputLines);
});

function processInputData(linesToProcess) {
  const charA = 'a'.charCodeAt(0);
  const charT = 't'.charCodeAt(0);
  const charZ = 'z'.charCodeAt(0);

  function applyCharShift(inputChar, shiftValue) {
    const isSpecialChar = inputChar === ' ' || inputChar === '.';
    if (isSpecialChar) {
      return inputChar;
    }

    let charCode = inputChar.charCodeAt(0);
    let shiftedCode = charCode - shiftValue;

    let finalCode = shiftedCode;
    if (shiftedCode > charZ) {
      finalCode = charA + shiftedCode - charZ;
    }
    return String.fromCharCode(finalCode);
  }

  function determineShiftAmount(referenceChar) {
    const charCode = referenceChar.charCodeAt(0);
    let rawShift = charCode - charT;

    const alphabetOffsetForWrap = charZ - charT;

    if (rawShift < 0) {
      return alphabetOffsetForWrap - rawShift;
    } else {
      return rawShift;
    }
  }

  function transformStringWithShift(text, shiftValue, charShifter) {
    return text.split('').map(char => charShifter(char, shiftValue)).join('');
  }

  const recognizedWordsSet = new Set(['the', 'this', 'that']);

  linesToProcess.forEach(function(currentLine) {
    const trimmedLine = currentLine.trim();
    if (trimmedLine.length === 0) {
      return;
    }

    let calculatedShiftValue;
    const lineWordTokens = currentLine.split(/[ \.]/g);

    for (let tokenIndex = 0; tokenIndex < lineWordTokens.length; tokenIndex++) {
      const currentWord = lineWordTokens[tokenIndex];
      calculatedShiftValue = determineShiftAmount(currentWord);

      const shiftedWordResult = transformStringWithShift(currentWord, calculatedShiftValue, applyCharShift);

      if (recognizedWordsSet.has(shiftedWordResult)) {
        break;
      }
    }

    console.log(transformStringWithShift(currentLine, calculatedShiftValue, applyCharShift));
  });
}
