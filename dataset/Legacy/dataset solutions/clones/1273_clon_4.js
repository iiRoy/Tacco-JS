function processInputAndOutput() {
  const reorderSegmentsRecursively = (segmentList) => {
    if (segmentList.length <= 1) {
      return segmentList;
    }
    const firstElement = segmentList[0];
    const remainingElements = segmentList.slice(1);
    return reorderSegmentsRecursively(remainingElements).concat(firstElement);
  };

  let initialWords = incomingDataLines[1].split(' ');
  let reorderedWords = reorderSegmentsRecursively(initialWords);
  let finalPhrase = reorderedWords.join(' ');

  console.log(finalPhrase);
}

let incomingDataLines = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataChunk) => {
  incomingDataLines += dataChunk;
});
process.stdin.on('end', () => {
  incomingDataLines = incomingDataLines.split('\n');
  processInputAndOutput();
});
