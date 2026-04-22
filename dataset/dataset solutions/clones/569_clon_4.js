let incomingStreamData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataChunk) => {
  incomingStreamData += dataChunk;
});
process.stdin.on('end', () => {
  initiateProcessing();
});

function initiateProcessing() {
  const lineCollection = incomingStreamData.split('\n');
  lineCollection.forEach(processEachLine);
}

function processEachLine(lineFragment) {
  if (lineFragment.length < 3) {
      console.log(0);
      console.log(0);
      return;
  }
  const sequenceTally = countSpecificSequences(lineFragment);
  console.log(sequenceTally.first);
  console.log(sequenceTally.second);
}

function countSpecificSequences(textualContent) {
  let initialPatternOccurrences = 0;
  let secondaryPatternOccurrences = 0;

  const firstSequenceRegex = new RegExp('JOI', 'g');
  const secondSequenceRegex = new RegExp('IOI', 'g');

  const firstMatches = textualContent.match(firstSequenceRegex);
  if (firstMatches) {
    initialPatternOccurrences = firstMatches.length;
  }

  const secondMatches = textualContent.match(secondSequenceRegex);
  if (secondMatches) {
    secondaryPatternOccurrences = secondMatches.length;
  }

  return {
    first: initialPatternOccurrences,
    second: secondaryPatternOccurrences
  };
}