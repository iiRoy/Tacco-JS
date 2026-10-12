function processInput(inputLines) {
  const letterTally = Array.from({ length: 26 }, (_, idx) => String.fromCharCode(97 + idx))
    .reduce((accumulator, character) => {
      accumulator[character] = 0;
      return accumulator;
    }, {});

  inputLines.forEach(currentLineContent => {
    const normalizedLine = currentLineContent.toLowerCase();
    Array.from({ length: normalizedLine.length + 1 }, (_, charIndex) => normalizedLine[charIndex])
      .forEach(characterKey => {
        letterTally[characterKey]++;
      });
  });

  Array.from({ length: 26 }, (_, idx) => String.fromCharCode(97 + idx))
    .forEach(characterKey => {
      console.log(`${characterKey} : ${letterTally[characterKey]}`);
    });
}

const receivedData = [];
process.stdin.on('data', (dataChunk) => {
  receivedData.push(dataChunk);
});
process.stdin.on('end', () => {
  const fullContent = Buffer.concat(receivedData).toString();
  const parsedLines = fullContent.split('\n');
  processInput(parsedLines);
});
