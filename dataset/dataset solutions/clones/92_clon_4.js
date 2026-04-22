var collectedPayload = '';

function performComputation() {
  const processedLines = collectedPayload.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let lineCursor = 0;

  while (lineCursor < processedLines.length) {
    let segmentCount = Number.parseInt(processedLines[lineCursor++], 10);

    if (!segmentCount) {
      break;
    }

    let currentItems = [];
    for (let itemIndex = 0; itemIndex < segmentCount; itemIndex++) {
      if (lineCursor < processedLines.length) {
        currentItems.push(Number.parseInt(processedLines[lineCursor++], 10));
      } else {
        currentItems.push(NaN);
      }
    }

    const resultValue = calculatePeakSubsegment(currentItems);
    console.log(resultValue);
  }
}

function calculatePeakSubsegment(numericSeries) {
    if (numericSeries.length === 0) {
        return -Infinity;
    }

    const finalAccumulation = numericSeries.reduce((accumulatorPair, elementValue) => {
        let [currentMaxEnd, overallMax] = accumulatorPair;

        currentMaxEnd = Math.max(elementValue, currentMaxEnd + elementValue);
        overallMax = Math.max(overallMax, currentMaxEnd);

        return [currentMaxEnd, overallMax];
    }, [numericSeries[0], numericSeries[0]]);

    return finalAccumulation[1];
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataSegment) {
  collectedPayload += dataSegment;
});

process.stdin.on('end', function() {
  performComputation();
});