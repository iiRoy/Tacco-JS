const rawInputAccumulator = [];
const inputSource = process.stdin;
inputSource.resume();
inputSource.setEncoding('utf-8');

inputSource.on('data', (dataChunk) => {
  rawInputAccumulator.push(dataChunk);
});

inputSource.on('end', () => {
  const allInputLines = rawInputAccumulator.join('').split('\n');

  function* taskProducer(sourceLines) {
    let currentLineIndex = 0;
    while (sourceLines[currentLineIndex] !== '-') {
      const initialString = sourceLines[currentLineIndex++];
      const shuffleCount = parseInt(sourceLines[currentLineIndex++], 10);
      const rotationAmounts = [];
      for (let k = 0; k < shuffleCount; k++) {
        rotationAmounts.push(parseInt(sourceLines[currentLineIndex++], 10));
      }
      yield { initialString, rotationAmounts };
    }
  }

  const processedResults = Array.from(taskProducer(allInputLines)).map(
    ({ initialString, rotationAmounts }) => {
      return rotationAmounts.reduce((currentString, rotationOffset) => {
        const stringLength = currentString.length;
        if (rotationOffset >= stringLength) {
          return currentString;
        }
        const charArray = Array.from(currentString);
        const rotatedPart = charArray.splice(0, rotationOffset);
        return charArray.concat(rotatedPart).join('');
      }, initialString);
    }
  );

  console.log(processedResults.join('\n'));
});
