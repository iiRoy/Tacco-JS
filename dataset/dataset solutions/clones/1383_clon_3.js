function processInputData(inputLines) {
  const firstLineContent = inputLines[0];
  const totalWordCount = parseInt(firstLineContent, 10);

  const rawWords = inputLines.slice(1);
  const sortedWordList = rawWords.sort();

  const firstSortedWord = sortedWordList[0];
  console.log(firstSortedWord);
}

(function setupInputProcessing() {
  let receivedDataParts = [];

  process.stdin.on('data', (currentDataPart) => {
    receivedDataParts.push(currentDataPart);
  });

  process.stdin.on('end', () => {
    const allDataBuffer = receivedDataParts.join('');
    const inputLines = allDataBuffer.split('\n');

    processInputData(inputLines);
  });
})();
