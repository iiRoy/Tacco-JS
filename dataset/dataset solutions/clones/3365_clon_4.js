let rawInputBuffer = '';

function processInputData(inputLines) {
  const firstLineContent = inputLines[0] || '';

  const twoOccurrenceCount = firstLineContent.split('').reduce((currentTally, characterUnit) => {
    return characterUnit === '2' ? currentTally + 1 : currentTally;
  }, 0);

  console.log(twoOccurrenceCount);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputChunk) => {
  rawInputBuffer += inputChunk;
});

process.stdin.on('end', () => {
  const processedLines = rawInputBuffer.split('\n');
  processInputData(processedLines);
});
