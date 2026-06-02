let incomingTextBuffer = '';

function processSingleSegment(segmentContent) {
  const occurrenceTally = { joi: 0, ioi: 0 };
  const searchPattern = /(JOI|IOI)/g;

  const matchIterator = segmentContent.matchAll(searchPattern);

  for (const matchResult of matchIterator) {
    const foundSequence = matchResult[0];
    if (foundSequence === "JOI") {
      occurrenceTally.joi++;
    } else if (foundSequence === "IOI") {
      occurrenceTally.ioi++;
    }
  }

  console.log(occurrenceTally.joi);
  console.log(occurrenceTally.ioi);
}

function analyzeTextSegments() {
  const lineCollection = incomingTextBuffer.split('\n');
  lineCollection.forEach(processSingleSegment);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  incomingTextBuffer += chunk;
});
process.stdin.on('end', function() {
  analyzeTextSegments();
});
