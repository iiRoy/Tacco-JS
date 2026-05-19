process.stdin.resume();
process.stdin.setEncoding('utf8');

function analyzeCipherVariants(originalInputLine) {
  const lineContent = String(originalInputLine);

  for (let currentShiftValue = 1; currentShiftValue <= 26; currentShiftValue++) {
    let transformedSegment = '';
    for (let charPosition = 0; charPosition < lineContent.length; charPosition++) {
      const currentCharacter = lineContent[charPosition];
      const characterCode = currentCharacter.charCodeAt(0);

      if (characterCode >= 0x61 && characterCode <= 0x7a) {
        const shiftedCharCode = 0x61 + (characterCode - 0x61 + currentShiftValue) % 26;
        transformedSegment += String.fromCharCode(shiftedCharCode);
      } else {
        transformedSegment += currentCharacter;
      }
    }

    if (/(?:the|this|that)/.test(transformedSegment)) {
      process.stdout.write(transformedSegment + '\n');
    }
  }
}

function handleInputChunk(inputBuffer) {
  inputBuffer.split('\n').forEach(analyzeCipherVariants);
}

process.stdin.on('data', handleInputChunk);
